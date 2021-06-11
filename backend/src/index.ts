import { TezosNodeEvent } from "./types";
import * as NodeMonitor from "./nodeMonitor";
import * as BakerMonitor from "./bakerMonitor";
import * as Notifier2 from "./notifier2";
import { create as EmailSender } from "./senders/email";
import { create as DesktopSender } from "./senders/desktop";
import * as EventLog from "./eventlog";
import { debug, info, warn, setLevel } from "loglevel";
import log, { LogLevelDesc } from "loglevel";
import * as prefix from "loglevel-plugin-prefix";
import * as Config from "./config";
import { format } from "date-fns";
import * as Chalk from "chalk";

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
    return color(level);
  };

  // Register prefix plug with loglevel.  This adds timestamp and level to logs.
  const timestampFormatter = (date: Date) =>
    format(date, "MM/dd/yyyy, H:mm:ss");
  const logger = log.noConflict();
  prefix.reg(logger);
  prefix.apply(logger, { timestampFormatter });
  // colorize output
  prefix.apply(log, {
    format(level, _name, timestamp) {
      return `${Chalk.gray(`[${timestamp}]`)} ${colorizeLevel(level)}`;
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

  const eventLog = await EventLog.open(config.storageDirectory);

  const channels: Notifier2.Channel[] = [];

  const emailConfig = config.getEmailConfig();
  if (emailConfig?.enabled) {
    const emailChannel = Notifier2.createChannel(
      "email",
      EmailSender(emailConfig),
      config.storageDirectory,
      eventLog
    );
    channels.push(emailChannel);
  }

  const desktopConfig = config.getDesktopConfig();
  if (desktopConfig?.enabled) {
    const desktopChannel = Notifier2.createChannel(
      "desktop",
      DesktopSender(desktopConfig),
      config.storageDirectory,
      eventLog
    );
    channels.push(desktopChannel);
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
  info("Done.");
};

main();
