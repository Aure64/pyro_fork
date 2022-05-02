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
import { writeJson, ensureExists, readJson } from "./fs-utils";
import { lock } from "proper-lockfile";
import { join as joinPath, normalize as normalizePath } from "path";

import { setup as setupLogging } from "./logging";

import { start as startAPIServer } from "./api/server";

type TzClientPkhListItem = { name: string; value: string };

type TzClientConfig = { endpoint: string };

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
  const { teztnets } = nodeMonitorConfig;

  const bakerMonitorConfig = config.bakerMonitor;

  const userHome = process.env.HOME;
  const tezosClientBaseDir = [
    "/var/lib/tezos/.tezos-client",
    `${userHome}/.tezos-client`,
    process.env.TEZOS_CLIENT_DIR,
  ];

  const tezosClientBakers = [];
  const tezosClientEndpoints = [];

  if (config.autodetect.enabled) {
    for (const dir of tezosClientBaseDir) {
      if (!dir) continue;
      const pkhFile = joinPath(dir, "public_key_hashs");
      try {
        info(`Reading tezos client pkh list from ${pkhFile}...`);
        const pkhList = (await readJson(pkhFile)) as TzClientPkhListItem[];
        for (const { name, value } of pkhList) {
          if (value) {
            info(`Found pkh ${name} ${value}`);
            if (name == "baker") {
              tezosClientBakers.push(value);
              break;
            }
          }
        }
      } catch (err) {
        info(`Could not read ${pkhFile}`);
        debug(err);
      }
    }

    if (tezosClientBakers.length > 0) {
      for (const dir of tezosClientBaseDir) {
        if (!dir) continue;
        const tzClientConfigFile = joinPath(dir, "config");
        try {
          info(`Reading tezos client config from ${tzClientConfigFile}...`);
          const tzClientConfig = (await readJson(
            tzClientConfigFile
          )) as TzClientConfig;
          if (tzClientConfig.endpoint) {
            info(`Found tezos client endpoint ${tzClientConfig.endpoint}`);
            tezosClientEndpoints.push(tzClientConfig.endpoint);
          }
        } catch (err) {
          info(`Could not read ${tzClientConfigFile}`);
          debug(err);
        }
      }
    }
  }

  if (tezosClientEndpoints.length > 0) {
    bakerMonitorConfig.rpc =
      tezosClientEndpoints[tezosClientEndpoints.length - 1];
    info(`Using tezos client endpoint ${bakerMonitorConfig.rpc} for baker rpc`);
  }

  const bakers = [...tezosClientBakers, ...bakerMonitorConfig.bakers];
  bakerMonitorConfig.bakers = bakers;

  console.error(config.ui);

  //if there are bakers to monitor also monitor rpc node
  const nodes =
    bakers.length === 0
      ? nodeMonitorConfig.nodes
      : [
          bakerMonitorConfig.rpc,
          ...tezosClientEndpoints,
          ...nodeMonitorConfig.nodes,
        ];

  if (bakers.length === 0 && nodes.length === 0 && !teztnets) {
    console.error("You must specify nodes or bakers to watch.");
    process.exit(1);
  }

  let uiConfig = config.ui;
  if (
    (tezosClientEndpoints.length > 0 || tezosClientBakers.length > 0) &&
    config.ui.show_system_info === undefined
  ) {
    info("Found local tezos setup, enabling system info ui");
    uiConfig = { ...config.ui, show_system_info: true };
  }

  const bakerMonitor =
    bakers.length > 0
      ? await BakerMonitor.create(
          storageDir,
          bakerMonitorConfig,
          uiConfig.enabled,
          onEvent
        )
      : null;

  const nodeMonitor =
    nodes.length > 0 || teztnets
      ? await NodeMonitor.create(onEvent, { ...nodeMonitorConfig, nodes })
      : null;

  const gc = EventLog.gc(eventLog, channels);

  const apiServer = uiConfig.enabled
    ? startAPIServer(
        nodeMonitor,
        bakerMonitor,
        bakerMonitorConfig.rpc,
        uiConfig
      )
    : null;

  const stop = (event: NodeJS.Signals) => {
    info(`Caught signal ${event}, shutting down...`);
    apiServer?.close();
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
