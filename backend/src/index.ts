import { TezosNodeEvent } from "./types";
import * as NodeMonitor from "./nodeMonitor";
import * as BakerMonitor from "./bakerMonitor";
import * as channel from "./channel";
import { create as EmailSender } from "./senders/email";
import { create as DesktopSender } from "./senders/desktop";
import { create as HttpSender } from "./senders/http";
import { create as TelegramSender } from "./senders/telegram";
import { create as SlackSender } from "./senders/slack";
import * as EventLog from "./eventlog";
import { debug, info, warn, error, setLevel } from "loglevel";
import loglevel, { LogLevelDesc } from "loglevel";
import * as prefix from "loglevel-plugin-prefix";
import * as Config from "./config";
import { format } from "date-fns";
import * as Chalk from "chalk";
import { writeJson, ensureExists } from "./fs-utils";
import { lock } from "proper-lockfile";

const setupLogging = (logLevel: LogLevelDesc) => {
  const colors: Record<string, Chalk.Chalk> = {
    TRACE: Chalk.magenta,
    DEBUG: Chalk.cyan,
    INFO: Chalk.blue,
    WARN: Chalk.yellow,
    ERROR: Chalk.red,
  };
  const colorizeLevel = (level: string): string => {
    const color = colors[level.toUpperCase()] || Chalk.black;
    return color(level[0]);
  };

  // Register prefix plug with loglevel.  This adds timestamp and level to logs.
  const timestampFormatter = (date: Date) => format(date, "yyyy-MM-dd H:mm:ss");
  const logger = loglevel.noConflict();
  prefix.reg(logger);
  prefix.apply(logger, { timestampFormatter });
  // colorize output
  prefix.apply(loglevel, {
    format(level, name, timestamp) {
      return `${Chalk.gray(`${timestamp}`)} ${colorizeLevel(level)} [${name}]`;
    },
  });

  setLevel(logLevel);
};

const main = async () => {
  // Makes the script crash on unhandled rejections instead of silently ignoring them.
  process.on("unhandledRejection", (err) => {
    throw err;
  });

  const config = await Config.load();
  setupLogging(config.getLogLevel());

  const pid = process.pid;
  const pidFile = `${config.storageDirectory}/pid`;
  let pidFileLock;

  try {
    await ensureExists(pidFile, pid);
    pidFileLock = await lock(pidFile);
  } catch (err) {
    error(err);
    process.exit(1);
  }

  await writeJson(pidFile, pid);

  const eventLog = await EventLog.open(config.storageDirectory);

  const channels: channel.Channel[] = [];

  const emailConfig = config.getEmailConfig();
  if (emailConfig?.enabled) {
    const emailChannel = await channel.create(
      "email",
      EmailSender(emailConfig),
      config.storageDirectory,
      eventLog
    );
    channels.push(emailChannel);
  }

  const desktopConfig = config.getDesktopConfig();
  if (desktopConfig?.enabled) {
    const desktopChannel = await channel.create(
      "desktop",
      DesktopSender(desktopConfig),
      config.storageDirectory,
      eventLog
    );
    channels.push(desktopChannel);
  }

  const endpointConfig = config.getEndpointConfig();
  if (endpointConfig?.enabled) {
    const endpointChannel = await channel.create(
      `${endpointConfig.url}`,
      HttpSender(endpointConfig),
      config.storageDirectory,
      eventLog
    );
    channels.push(endpointChannel);
  }

  const telegramConfig = config.getTelegramConfig();
  if (telegramConfig?.enabled) {
    const telegramChannel = await channel.create(
      "telegram",
      await TelegramSender(telegramConfig, (chatId: number) =>
        config.setTelegramChatId(chatId)
      ),
      config.storageDirectory,
      eventLog
    );
    channels.push(telegramChannel);
  }

  const slackConfig = config.getSlackConfig();
  if (slackConfig?.enabled) {
    const slackChannel = await channel.create(
      "slack",
      SlackSender(slackConfig),
      config.storageDirectory,
      eventLog
    );
    channels.push(slackChannel);
  }

  const onEvent = async (event: TezosNodeEvent) => {
    await eventLog.add(event);
  };

  const bakers = config.getBakers();
  const rpcNode = config.getRpc();
  const referenceNode = config.getReferenceNode();

  //always monitor rpc node
  const nodes = [...new Set([...config.getNodes(), rpcNode])];

  if (bakers.length === 0 && nodes.length === 0) {
    console.error("You must specify nodes or bakers to watch.");
    process.exit(1);
  }

  const bakerMonitor =
    bakers.length > 0
      ? await BakerMonitor.create(bakers, onEvent, config)
      : null;

  if (!referenceNode) {
    warn("Reference node is not set, node-on-a-branch detection is off");
  }

  const nodeMonitor =
    nodes.length > 0 ? NodeMonitor.create(onEvent, nodes, referenceNode) : null;

  const gc = EventLog.gc(eventLog, channels);

  const stop = (event: NodeJS.Signals) => {
    info(`Caught signal ${event}, shutting down...`);
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
  info("Done.");
};

main();
