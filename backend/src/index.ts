import { TezosNodeEvent } from "./types";
import * as NodeMonitor from "./nodeMonitor";
import * as BakerMonitor from "./bakerMonitor";
import * as Server from "./server";
import * as Notifier from "./notifier";
import * as args from "args";
import { debug, info, setLevel, LogLevelDesc, warn } from "loglevel";

const logLevelFromString = (value: string): LogLevelDesc => {
  switch (value) {
    case "trace":
      return "TRACE";
    case "info":
      return "INFO";
    case "debug":
      return "DEBUG";
    case "warn":
      return "WARN";
    case "error":
      return "ERROR";
    default:
      warn("Unknown logging level, using info");
      return "INFO";
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
  );

const options = args.parse(process.argv);
const bakersString: string | null = options.bakers;
const rpcNode: string = options.rpc;
const logLevel = logLevelFromString(options.logging);

setLevel(logLevel);

if (!bakersString) {
  args.showHelp();
  process.exit(1);
}

const bakers = bakersString.split(",");

const notifierConfig: Notifier.Config = {
  desktopConfig: { enableSound: false },
  maxRetries: 10,
  retryDelay: 60000,
};

const notifier = Notifier.create(notifierConfig);

const onEvent = (event: TezosNodeEvent) => {
  Notifier.notify(notifier, event);
};

const bakerMonitor = BakerMonitor.start({ bakers, onEvent, rpcNode });
const nodeMonitor = NodeMonitor.start(onEvent);
const server = Server.start();

process.on("SIGINT", () => {
  debug("Shutting down");
  BakerMonitor.halt(bakerMonitor);
  NodeMonitor.halt(nodeMonitor);
  Server.halt(server);
});

info("Kiln started");
