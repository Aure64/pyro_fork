import { TezosNodeEvent } from "./types";
import { debug, warn, info } from "loglevel";
import {
  Context,
  PollingSubscribeProvider,
  Subscription,
  TezosToolkit,
} from "@taquito/taquito";
import { RpcClient } from "@taquito/rpc";

type Monitor = {
  subscription: Subscription<string>;
  rpc: RpcClient;
  node: string;
};

type StartArgs = {
  node: string;
  onEvent: (event: TezosNodeEvent) => void;
};

export const start = ({ node, onEvent }: StartArgs): Monitor => {
  const toolkit = new TezosToolkit(node);
  const context = new Context(toolkit.rpc);
  const provider = new PollingSubscribeProvider(context);
  const subscription = provider.subscribe("head");
  const rpc = toolkit.rpc;
  const monitor: Monitor = { subscription, rpc, node };

  subscription.on("data", async (blockHash) => {
    debug(`Subscription received block: ${blockHash}`);

    const events = await checkBlockByHash({
      rpc: monitor.rpc,
      node,
      blockHash,
    });
    events.map(onEvent);
  });
  subscription.on("error", (error) => {
    warn(`Node subscription error: ${error.message}`);
    onEvent({
      type: "RPC",
      kind: "SUBSCRIPTION_ERROR",
      message: error.message,
    });
  });

  debug(`Node monitor started`);

  return monitor;
};

export const halt = (monitor: Monitor): void => {
  info("Halting node monitor");
  monitor.subscription.close();
};

type CheckBlockByHashArgs = {
  rpc: RpcClient;
  node: string;
  blockHash: string;
};

/**
 * Fetch and analyze the provided block for any significant events for the provided nodes.
 */
const checkBlockByHash = async ({
  node,
  blockHash,
}: CheckBlockByHashArgs): Promise<TezosNodeEvent[]> => {
  const events: TezosNodeEvent[] = [];

  debug(`Node monitor received block ${blockHash} for node ${node}`);

  return events;
};
