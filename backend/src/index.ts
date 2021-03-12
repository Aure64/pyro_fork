import { TezosNodeEvent } from "./types";
import * as NodeMonitor from "./nodeMonitor";
import * as BakerMonitor from "./bakerMonitor";
import * as Server from "./server";
import * as Notifier from "./notifier";
import { debug, info, setLevel } from "loglevel";
import log from "loglevel";
import * as prefix from "loglevel-plugin-prefix";
import * as Config from "./config";

const main = async () => {
  // Register prefix plug with loglevel.  This adds timestamp and level to logs.
  const logger = log.noConflict();
  prefix.reg(logger);
  prefix.apply(logger);

  await Config.load("./tmp/config.json");
  const nodes = Config.getNodes();
  const bakers = Config.getBakers();
  const rpcNode: string = Config.getRpc();
  const logLevel = Config.getLogLevel();
  const chain = Config.getChain();

  setLevel(logLevel);

  if (bakers.length === 0 && nodes.length === 0) {
    console.error("You must specify nodes or bakers to watch");
    process.exit(1);
  }

  const storageDirectory = "./tmp";

  const notifierConfig: Notifier.Config = {
    desktopConfig: { enableSound: false },
    queue: {
      maxRetries: 10,
      retryDelay: 60000,
    },
    storageDirectory,
  };

  const notifier = await Notifier.create(notifierConfig);

  const onEvent = (event: TezosNodeEvent) => {
    Notifier.notify(notifier, event);
  };

  const bakerMonitor =
    bakers.length > 0
      ? BakerMonitor.start({ bakers, onEvent, rpcNode, storageDirectory })
      : null;
  const nodeMonitor =
    nodes.length > 0
      ? NodeMonitor.start({ onEvent, nodes, referenceNode: rpcNode, chain })
      : null;
  const server = Server.start();

  process.on("SIGINT", () => {
    debug("Shutting down");
    Config.save();
    if (bakerMonitor) BakerMonitor.halt(bakerMonitor);
    if (nodeMonitor) NodeMonitor.halt(nodeMonitor);
    Server.halt(server);
    process.exit(0);
  });
};

main();
info("Kiln started");
