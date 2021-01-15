import { TezosNodeEvent } from "./types";
import * as NodeMonitor from "./nodeMonitor";
import * as BakerMonitor from "./bakerMonitor";
import * as Server from "./server";
import * as Notifier from "./notifier";
import * as args from "args";

args
  .option("baker", "Node to watch for baking events.")
  .option(
    "rpc",
    "Tezos RPC URL to query for baker and chain info",
    "https://mainnet-tezos.giganode.io/"
  );

const options = args.parse(process.argv);
const baker: string | null = options.baker;
const rpcNode: string = options.rpc;

if (!baker) {
  console.error("Baker parameter is required");
  console.error("Run 'yarn dev help'");
  process.exit(1);
}

const onEvent = (event: TezosNodeEvent) => {
  Notifier.notify(event);
};

const bakerMonitor = BakerMonitor.start({ baker, onEvent, rpcNode });
const nodeMonitor = NodeMonitor.start(onEvent);
const server = Server.start();

process.on("SIGINT", () => {
  console.log("server is shutting down");
  BakerMonitor.halt(bakerMonitor);
  NodeMonitor.halt(nodeMonitor);
  Server.halt(server);
});

console.log("Kiln started");
