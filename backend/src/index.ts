import { TezosNodeEvent } from "./types";
import NodeMonitor from "./nodeMonitor";
import BakerMonitor from "./bakerMonitor";
import Server from "./server";
import notifier from "./notifier";

const onEvent = (event: TezosNodeEvent) => {
  notifier.notify(event);
};

const bakerMonitor = BakerMonitor.start(onEvent);
const nodeMonitor = NodeMonitor.start(onEvent);
const server = Server.start();

process.on("SIGINT", () => {
  console.log("server is shutting down");
  BakerMonitor.halt(bakerMonitor);
  NodeMonitor.halt(nodeMonitor);
  Server.halt(server);
});

console.log("Kiln started");
