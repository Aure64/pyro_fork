import { Result, PeerNodeEvent, TezosNodeEvent } from "./types";
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
    const nodeData: Record<string, NodeInfo> = {};

    subscription.on("data", async (blockHash) => {
      debug(`Subscription received block: ${blockHash}`);

      const previousNodeInfo = nodeData[node];
      const nodeInfoResult = await updateNodeInfo({
        node,
        blockHash,
        rpc: toolkit.rpc,
      });
      if (nodeInfoResult.type === "ERROR") {
        //TODO handle error
        const errorEvent: PeerNodeEvent = {
          type: "PEER",
          kind: "UPDATE_ERROR",
          node,
          message: `Error updating info for node ${node}`,
        };
        onEvent(errorEvent);
      } else {
        const nodeInfo = nodeInfoResult.data;
        const events = checkBlockInfo({
          node,
          nodeInfo,
          previousNodeInfo,
        });
        events.map(onEvent);
        // storing previous info in memory for now.  Eventually this will need to be persisted to the DB
        // with other data (eg current block)
        nodeData[node] = nodeInfo;
      }
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

type NodeInfo = {
  head: string;
  bootstrappedStatus: BootstrappedStatus;
};

type UpdateNodeInfoArgs = {
  node: string;
  blockHash: string;
  rpc: RpcClient;
};

const updateNodeInfo = async ({
  node,
  blockHash,
}: UpdateNodeInfoArgs): Promise<Result<NodeInfo>> => {
  debug(`Node monitor received block ${blockHash} for node ${node}`);

  const [bootstrappedError, bootstrappedStatus] = await to(
    isBootstrapped(node)
  );

  if (bootstrappedError) {
    warn(bootstrappedError.message);
    return { type: "ERROR", message: bootstrappedError.message };
  } else if (!bootstrappedStatus) {
    const message = `Get bootstrapped status returned empty result for ${node}`;
    warn(message);
    return { type: "ERROR", message };
  } else {
    const { bootstrapped, sync_state } = bootstrappedStatus;
    debug(
      `Node ${node} is bootstrapped: ${bootstrapped} with sync_state: ${sync_state}`
    );
  }

  return { type: "SUCCESS", data: { head: blockHash, bootstrappedStatus } };
};

type CheckBlockInfoArgs = {
  node: string;
  nodeInfo: NodeInfo;
  previousNodeInfo: NodeInfo | undefined;
};

/**
 * Analyze the provided node info for any significant events.
 */
export const checkBlockInfo = ({
  node,
  nodeInfo,
  previousNodeInfo,
}: CheckBlockInfoArgs): TezosNodeEvent[] => {
  const events: TezosNodeEvent[] = [];

  if (
    nodeInfo.bootstrappedStatus.bootstrapped &&
    nodeInfo.bootstrappedStatus.sync_state !== "synced"
  ) {
    debug(`Node ${node} is behind`);
    events.push({
      type: "PEER",
      kind: "NODE_BEHIND",
      node,
      message: "Node is behind",
    });
  } else if (
    catchUpOccurred(
      previousNodeInfo?.bootstrappedStatus,
      nodeInfo.bootstrappedStatus
    )
  ) {
    debug(`Node ${node} caught up`);
    events.push({
      type: "PEER",
      kind: "NODE_CAUGHT_UP",
      node,
      message: "Node caught up",
    });
  }

  return events;
};

export type BootstrappedStatus = {
  bootstrapped: boolean;
  sync_state: "synced" | "unsynced" | "stuck";
};

const isBootstrapped = async (node: string): Promise<BootstrappedStatus> => {
  const url = `${node}/chains/main/is_bootstrapped`;
  const response = await fetch(url);
  return response.json();
};

const catchUpOccurred = (
  previousResult: BootstrappedStatus | undefined,
  currentStatus: BootstrappedStatus
) => {
  // can't determine this without a previous status
  if (!previousResult) {
    return false;

    // no catch up if either status wasn't boostrapped
  } else if (!previousResult.bootstrapped || !currentStatus.bootstrapped) {
    return false;
  } else {
    return (
      previousResult.sync_state !== "synced" &&
      currentStatus.sync_state === "synced"
    );
  }
};
