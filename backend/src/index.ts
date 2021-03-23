import { TezosNodeEvent } from "./types";
import * as NodeMonitor from "./nodeMonitor";
import * as BakerMonitor from "./bakerMonitor";
import * as Server from "./server";
import * as Notifier from "./notifier";
import { debug, info, setLevel } from "loglevel";
import log from "loglevel";
import * as prefix from "loglevel-plugin-prefix";
import * as Config from "./config";
import { format } from "date-fns";

const main = async () => {
  // Register prefix plug with loglevel.  This adds timestamp and level to logs.
  const timestampFormatter = (date: Date) =>
    format(date, "MM/dd/yyyy, H:mm:ss");
  const logger = log.noConflict();
  prefix.reg(logger);
  prefix.apply(logger, { timestampFormatter });

  const config = await Config.load("./tmp/config.json");
  const logLevel = config.getLogLevel();

  setLevel(logLevel);

  const storageDirectory = "./tmp";

  const desktopConfig = config.getDesktopConfig();
  const emailConfig = config.getEmailConfig();
  const telegramConfig = config.getTelegramConfig();
  const slackConfig = config.getSlackConfig();

  const notifierConfig: Notifier.NotifierConfig = {
    desktopConfig,
    emailConfig,
    telegramConfig,
    slackConfig,
    queue: {
      maxRetries: 10,
      retryDelay: 60000,
    },
    storageDirectory,
    config,
  };

  const notifier = await Notifier.create(notifierConfig);

  const onEvent = (event: TezosNodeEvent) => {
    Notifier.notify(notifier, event);
  };

  const nodes = config.getNodes();
  const bakers = config.getBakers();
  const rpcNode = config.getRpc();
  const chain = config.getChain();
  if (bakers.length === 0 && nodes.length === 0) {
    console.error("You must specify nodes or bakers to watch");
    process.exit(1);
  }

  const bakerMonitor =
    bakers.length > 0
      ? BakerMonitor.start({
          bakers,
          config,
          onEvent,
          rpcNode,
          storageDirectory,
        })
      : null;
  const nodeMonitor =
    nodes.length > 0
      ? NodeMonitor.start({ onEvent, nodes, referenceNode: rpcNode, chain })
      : null;
  const server = Server.start();

  process.on("SIGINT", async () => {
    debug("Shutting down");
    await Config.save();
    if (bakerMonitor) BakerMonitor.halt(bakerMonitor);
    if (nodeMonitor) NodeMonitor.halt(nodeMonitor);
    Server.halt(server);
    process.exit(0);
  });
};

main();
info("Kiln started");
