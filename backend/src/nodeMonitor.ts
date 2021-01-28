import { TezosNodeEvent } from "./types";
import { debug, warn, info } from "loglevel";
import {
  Context,
  PollingSubscribeProvider,
  Subscription,
  TezosToolkit,
} from "@taquito/taquito";
import { RpcClient } from "@taquito/rpc";
import fetch from "cross-fetch";
import to from "await-to-js";

type Monitor = {
  subscriptions: Subscription<string>[];
  nodes: string[];
};

type StartArgs = {
  nodes: string[];
  onEvent: (event: TezosNodeEvent) => void;
};

export const start = ({ nodes, onEvent }: StartArgs): Monitor => {
  const subscriptions = nodes.map((node) => {
    const toolkit = new TezosToolkit(node);
    const context = new Context(toolkit.rpc);
    const provider = new PollingSubscribeProvider(context);
    const subscription = provider.subscribe("head");

    subscription.on("data", async (blockHash) => {
      debug(`Subscription received block: ${blockHash}`);

      const events = await checkBlockByHash({
        rpc: toolkit.rpc,
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

    return subscription;
  });

  const monitor: Monitor = { subscriptions, nodes };

  debug(`Node monitor started`);

  return monitor;
};

export const halt = (monitor: Monitor): void => {
  info("Halting node monitor");
  for (const subscription of monitor.subscriptions) {
    subscription.close();
  }
};

type CheckBlockByHashArgs = {
  rpc: RpcClient;
  node: string;
  blockHash: string;
};

/**
 * Fetch and analyze the provided block for any significant events for the provided nodes.
 */
export const checkBlockByHash = async ({
  node,
  blockHash,
}: CheckBlockByHashArgs): Promise<TezosNodeEvent[]> => {
  const events: TezosNodeEvent[] = [];

  debug(`Node monitor received block ${blockHash} for node ${node}`);

  const [bootstrappedError, bootstrappedResult] = await to(
    isBootstrapped(node)
  );

  if (bootstrappedError) {
    warn(bootstrappedError.message);
    events.push({
      type: "PEER",
      kind: bootstrappedError.name,
      node,
      message: bootstrappedError.message,
    });
  } else if (!bootstrappedResult) {
    const message = `Get bootstrapped status returned empty result for ${node}`;
    warn(message);
    events.push({
      type: "PEER",
      kind: "GET_BOOTSTRAPPED_STATUS_ERROR",
      node,
      message,
    });
  } else {
    const { bootstrapped, sync_state } = bootstrappedResult;
    debug(
      `Node ${node} is bootstrapped: ${bootstrapped} with sync_state: ${sync_state}`
    );
    if (bootstrapped && sync_state !== "synced") {
      debug(`Node ${node} is behind`);
      events.push({
        type: "PEER",
        kind: "NODE_BEHIND",
        node,
        message: "Node is behind",
      });
    }
  }

  return events;
};

type BootstrappedStatus = {
  bootstrapped: boolean;
  sync_state: "synced" | "unsynced" | "stuck";
};

const isBootstrapped = async (node: string): Promise<BootstrappedStatus> => {
  const url = `${node}/chains/main/is_bootstrapped`;
  const response = await fetch(url);
  return response.json();
};
