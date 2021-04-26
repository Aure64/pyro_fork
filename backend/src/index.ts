import { TezosNodeEvent } from "./types";
import * as NodeMonitor from "./nodeMonitor";
import * as BakerMonitor from "./bakerMonitor";
import * as Server from "./server";
import * as Notifier from "./notifier";
import { debug, info, setLevel } from "loglevel";
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

  const notifier = await Notifier.create(config);

  const onEvent = (event: TezosNodeEvent) => {
    Notifier.notify(notifier, event);
  };

  const nodes = config.getNodes();
  const bakers = config.getBakers();
  const rpcNode = config.getRpc();
  if (bakers.length === 0 && nodes.length === 0) {
    console.error("You must specify nodes or bakers to watch.");
    process.exit(1);
  }

  const bakerMonitor =
    bakers.length > 0
      ? await BakerMonitor.start({
          bakers,
          config,
          onEvent,
        })
      : null;
  const nodeMonitor =
    nodes.length > 0
      ? NodeMonitor.start({ onEvent, nodes, referenceNode: rpcNode })
      : null;
  const server = Server.start();

  process.on("SIGINT", () => {
    debug("Shutting down");
    config.save();
    if (bakerMonitor) BakerMonitor.halt(bakerMonitor);
    if (nodeMonitor) NodeMonitor.halt(nodeMonitor);
    Server.halt(server);
    process.exit(0);
  });
  info("Pyrometer started");
};

main();
