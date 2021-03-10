import { TezosNodeEvent } from "./types";
import * as NodeMonitor from "./nodeMonitor";
import * as BakerMonitor from "./bakerMonitor";
import * as Server from "./server";
import * as Notifier from "./notifier";
import * as args from "args";
import { debug, info, setLevel, LogLevelDesc, warn } from "loglevel";
import log from "loglevel";
import * as prefix from "loglevel-plugin-prefix";

const main = async () => {
  // Register prefix plug with loglevel.  This adds timestamp and level to logs.
  const logger = log.noConflict();
  prefix.reg(logger);
  prefix.apply(logger);

  const logLevels: LogLevelDesc[] = ["trace", "info", "debug", "warn", "error"];
  const logLevelFromString = (value: string): LogLevelDesc => {
    if (logLevels.includes(value as LogLevelDesc)) {
      return value as LogLevelDesc;
    } else {
      warn("Unknown logging level, using info");
      return "info";
    }
  };

  args
    .option(
      "bakers",
      "Comma-delimited list (no spaces) of nodes to watch for baking events."
    )
    .option(
      "logging",
      "(optional) Level of logging. [trace, debug, info, warn, error]",
      "info"
    )
    .option(
      "rpc",
      "(optional) Tezos RPC URL to query for baker and chain info",
      "https://mainnet-tezos.giganode.io/"
    )
    .option("chain", "(optional) Chain to monitor and query against", "main")
    .option("nodes", "Comma-delimited list of node URLs to watch");

  const options = args.parse(process.argv);
  const bakersString: string = options.bakers || "";
  const rpcNode: string = options.rpc;
  const nodesString: string = options.nodes || "";
  const logLevel = logLevelFromString(options.logging);
  const chain = options.chain;

  setLevel(logLevel);

  const bakers = bakersString.split(",").filter((baker) => baker.length > 0);
  const nodes = nodesString.split(",").filter((node) => node.length > 0);

  if (bakers.length === 0 && nodes.length === 0) {
    console.error("You must specify nodes or bakers to watch");
    args.showHelp();
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
    if (bakerMonitor) BakerMonitor.halt(bakerMonitor);
    if (nodeMonitor) NodeMonitor.halt(nodeMonitor);
    Server.halt(server);
    process.exit(0);
  });
};

main();
info("Kiln started");
