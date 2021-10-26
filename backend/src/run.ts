import { Event, Sender } from "./events";
import * as NodeMonitor from "./nodeMonitor";
import * as BakerMonitor from "./bakerMonitor";
import * as channel from "./channel";
import { create as EmailSender } from "./senders/email";
import { create as DesktopSender } from "./senders/desktop";
import { create as HttpSender } from "./senders/http";
import { create as TelegramSender } from "./senders/telegram";
import { create as SlackSender } from "./senders/slack";
import * as EventLog from "./eventlog";
import { debug, info, warn, error } from "loglevel";
import * as Config from "./config";
import { writeJson, ensureExists } from "./fs-utils";
import { lock } from "proper-lockfile";
import { join as joinPath, normalize as normalizePath } from "path";

import { setup as setupLogging } from "./logging";

import { start as startAPIServer } from "./api/server";

const run = async (config: Config.Config) => {
  // Makes the script crash on unhandled rejections instead of silently ignoring them.
  process.on("unhandledRejection", (err) => {
    throw err;
  });

  setupLogging(config.logging);

  const storageDir = normalizePath(config.storageDirectory);

  const pid = process.pid;
  const pidFile = joinPath(storageDir, "pid");
  let pidFileLock;

  try {
    await ensureExists(pidFile, pid);
    pidFileLock = await lock(pidFile);
  } catch (err) {
    error(err);
    process.exit(1);
  }

  await writeJson(pidFile, pid);

  const eventLog = await EventLog.open<Event>(storageDir);
  const notificationsConfig = config.notifications;

  const createChannel = async (
    name: string,
    sender: Sender
  ): Promise<channel.Channel> => {
    return await channel.create(
      name,
      sender,
      storageDir,
      eventLog,
      notificationsConfig
    );
  };

  const channels: channel.Channel[] = [];

  const emailConfig = config.email;
  if (emailConfig?.enabled) {
    channels.push(await createChannel("email", EmailSender(emailConfig)));
  }

  const desktopConfig = config.desktop;
  if (desktopConfig?.enabled) {
    channels.push(await createChannel("desktop", DesktopSender(desktopConfig)));
  }

  const webhookConfig = config.webhook;
  if (webhookConfig?.enabled) {
    channels.push(await createChannel("webhook", HttpSender(webhookConfig)));
  }

  const telegramConfig = config.telegram;
  if (telegramConfig?.enabled) {
    channels.push(
      await createChannel(
        "telegram",
        await TelegramSender(telegramConfig, storageDir)
      )
    );
  }

  const slackConfig = config.slack;
  if (slackConfig?.enabled) {
    channels.push(await createChannel("slack", SlackSender(slackConfig)));
  }

  const excludedEvents = config.excludedEvents;

  const onEvent = async (event: Event) => {
    if ("kind" in event && excludedEvents.includes(event.kind)) {
      debug(`Event excluded because type ${event.kind} is filtered`, event);
      return;
    }
    await eventLog.add(event);
  };

  const nodeMonitorConfig = config.nodeMonitor;

  const bakerMonitorConfig = config.bakerMonitor;
  const { bakers } = bakerMonitorConfig;

  //always monitor rpc node
  const nodes = [
    ...new Set([bakerMonitorConfig.rpc, ...nodeMonitorConfig.nodes]),
  ];

  if (bakers.length === 0 && nodes.length === 0) {
    console.error("You must specify nodes or bakers to watch.");
    process.exit(1);
  }

  const bakerMonitor =
    bakers.length > 0
      ? await BakerMonitor.create(storageDir, bakerMonitorConfig, onEvent)
      : null;

  const { reference_node: referenceNode } = nodeMonitorConfig;

  if (!referenceNode) {
    warn("Reference node is not set, node-on-a-branch detection is off");
  }

  const nodeMonitor =
    nodes.length > 0
      ? NodeMonitor.create(onEvent, { ...nodeMonitorConfig, nodes })
      : null;

  console.log("nodeMonitor", nodeMonitor);

  const gc = EventLog.gc(eventLog, channels);

  const apiServer = startAPIServer(
    nodeMonitor,
    bakerMonitor,
    bakerMonitorConfig.rpc,
    4000
  );

  const stop = (event: NodeJS.Signals) => {
    info(`Caught signal ${event}, shutting down...`);
    apiServer.close();
    bakerMonitor?.stop();
    nodeMonitor?.stop();
    for (const ch of channels) {
      ch.stop();
    }
    gc.stop();
    const gracePeriod = 5;
    const timeoutHandle = setTimeout(() => {
      info(`Some tasks are still running after ${gracePeriod} s, force exit`);
      process.exit(0);
    }, gracePeriod * 1e3);
    //make sure this timer itself doesn't delay process exit
    timeoutHandle.unref();
  };

  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  process.on("exit", (code) => info(`Done (exit code ${code})`));

  const channelTasks = channels.map((ch) => ch.start());
  const gcTask = gc.start();

  const allTasks = [...channelTasks, gcTask];

  if (nodeMonitor) {
    const nodeMonitorTask = nodeMonitor.start();
    allTasks.push(nodeMonitorTask);
  }

  if (bakerMonitor) {
    const bakerMonitorTask = bakerMonitor.start();
    allTasks.push(bakerMonitorTask);
  }

  info("Started");
  await Promise.all(allTasks);
  debug(`Releasing file lock on ${pidFile}`);
  await pidFileLock();
};

export default run;
