import { Result, PeerDataEvent, TezosNodeEvent } from "./types";
import { debug, warn, info } from "loglevel";
import {
  Context,
  PollingSubscribeProvider,
  Subscription,
  TezosToolkit,
} from "@taquito/taquito";
import { BlockHeaderResponse, RpcClient } from "@taquito/rpc";
import fetch from "cross-fetch";
import to from "await-to-js";
import { makeMemoizedAsyncFunction } from "./memoization";

const CHAIN = "main";

type Monitor = {
  subscriptions: Subscription<string>[];
  nodes: string[];
};

type StartArgs = {
  nodes: string[];
  onEvent: (event: TezosNodeEvent) => void;
  referenceNode: string;
};

export const start = ({
  nodes,
  onEvent,
  referenceNode,
}: StartArgs): Monitor => {
  let referenceNodeBlockHistory: BlockHeaderResponse[];

  const { rpc, subscription: referenceSubscription } = subscribeToNode(
    referenceNode,
    CHAIN
  );
  referenceSubscription.on("data", async (blockHash) => {
    debug(`Reference node subscription received block: ${blockHash}`);

    const historyResult = await fetchBlockHeaders({ blockHash, rpc });
    if (historyResult.type === "ERROR") {
      warn(
        `fetchBlockheaders failed for reference node ${referenceNode} because of ${historyResult.message}`
      );
      onEvent({
        type: "PEER_DATA",
        kind: "ERROR",
        message: historyResult.message,
      });
    } else {
      referenceNodeBlockHistory = historyResult.data;
    }
  });
  referenceSubscription.on("error", (error) => {
    warn(`Reference node subscription error: ${error.message}`);
    onEvent({
      type: "PEER_DATA",
      kind: "ERROR",
      message: error.message,
    });
  });

  // watch all other nodes
  const subscriptions = nodes.map((node) => {
    const { rpc, subscription } = subscribeToNode(node, CHAIN);
    const nodeData: Record<string, NodeInfo> = {};

    subscription.on("data", async (blockHash) => {
      debug(`Subscription received block: ${blockHash}`);

      const previousNodeInfo = nodeData[node];
      // skip checking boostrapped status if previous check failed
      const fetchBootstrappedStatus =
        previousNodeInfo === undefined ||
        previousNodeInfo.bootstrappedStatus !== undefined;
      const nodeInfoResult = await updateNodeInfo({
        node,
        blockHash,
        rpc,
        fetchBootstrappedStatus,
      });
      if (nodeInfoResult.type === "ERROR") {
        const errorEvent: PeerDataEvent = {
          type: "PEER_DATA",
          kind: "ERROR",
          message: `Error updating info for node ${node}`,
        };
        onEvent(errorEvent);
      } else {
        const nodeInfo = nodeInfoResult.data;
        const events = checkBlockInfo({
          node,
          nodeInfo,
          previousNodeInfo,
          referenceNodeBlockHistory,
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
        type: "PEER_DATA",
        kind: "ERROR",
        message: error.message,
      });
    });

    return subscription;
  });

  const monitor: Monitor = {
    subscriptions: [referenceSubscription, ...subscriptions],
    nodes,
  };

  debug(`Node monitor started`);

  return monitor;
};

const subscribeToNode = (
  node: string,
  chain: string
): { subscription: Subscription<string>; rpc: RpcClient } => {
  const toolkit = new TezosToolkit(new RpcClient(node, chain));
  const context = new Context(toolkit.rpc);
  const provider = new PollingSubscribeProvider(context);
  const subscription = provider.subscribe("head");
  const rpc = toolkit.rpc;
  rpc.getBlockHeader = makeMemoizedAsyncFunction(
    rpc.getBlockHeader.bind(rpc),
    ({ block }: { block: string }) => `${block}`
  );

  return { subscription, rpc };
};

export const halt = (monitor: Monitor): void => {
  info("Halting node monitor");
  for (const subscription of monitor.subscriptions) {
    subscription.close();
  }
};

export type NodeInfo = {
  head: string;
  bootstrappedStatus: BootstrappedStatus | undefined;
  history: BlockHeaderResponse[];
  peerCount: number;
};

type UpdateNodeInfoArgs = {
  node: string;
  blockHash: string;
  rpc: RpcClient;
  fetchBootstrappedStatus: boolean;
};

const updateNodeInfo = async ({
  node,
  blockHash,
  rpc,
  fetchBootstrappedStatus,
}: UpdateNodeInfoArgs): Promise<Result<NodeInfo>> => {
  debug(`Node monitor received block ${blockHash} for node ${node}`);
  let bootstrappedStatus, bootstrappedError;

  if (fetchBootstrappedStatus) {
    [bootstrappedError, bootstrappedStatus] = await to(
      isBootstrapped(node, CHAIN)
    );

    if (bootstrappedError) {
      warn(
        `isBoostrapped failed for node ${node} because of ${bootstrappedError.message}`
      );
      return { type: "ERROR", message: bootstrappedError.message };
    } else if (!bootstrappedStatus) {
      const message = `Get bootstrapped status returned empty result for ${node}`;
      warn(message);
    } else {
      const { bootstrapped, sync_state } = bootstrappedStatus;
      debug(
        `Node ${node} is bootstrapped: ${bootstrapped} with sync_state: ${sync_state}`
      );
    }
  }

  const historyResult = await fetchBlockHeaders({ blockHash, rpc });
  if (historyResult.type === "ERROR") {
    warn(
      `fetchBlockheaders failed for ${node} because of ${historyResult.message}`
    );
    return historyResult;
  }
  const history = historyResult.data;

  const [connectionsError, connectionsResult] = await to(
    getNetworkConnections(node)
  );
  if (connectionsError) {
    warn(
      `getNetworkConnections failed for node ${node} because of ${connectionsError.message}`
    );
    return { type: "ERROR", message: connectionsError.message };
  } else if (!connectionsResult) {
    const message = `Get connections status returned empty result for ${node}`;
    warn(message);
    return { type: "ERROR", message };
  } else {
    debug(`Node ${node} has ${connectionsResult.length} peers`);
  }
  const peerCount = connectionsResult.length;

  return {
    type: "SUCCESS",
    data: { head: blockHash, bootstrappedStatus, history, peerCount },
  };
};

const minimumPeers = 10;

type CheckBlockInfoArgs = {
  node: string;
  nodeInfo: NodeInfo;
  previousNodeInfo: NodeInfo | undefined;
  referenceNodeBlockHistory: BlockHeaderResponse[] | undefined;
};

/**
 * Analyze the provided node info for any significant events.
 */
export const checkBlockInfo = ({
  node,
  nodeInfo,
  previousNodeInfo,
  referenceNodeBlockHistory,
}: CheckBlockInfoArgs): TezosNodeEvent[] => {
  const events: TezosNodeEvent[] = [];

  if (nodeInfo.bootstrappedStatus) {
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
    if (
      referenceNodeBlockHistory &&
      nodeInfo.bootstrappedStatus.sync_state == "synced"
    ) {
      const ancestorDistance = findSharedAncestor(
        nodeInfo.history,
        referenceNodeBlockHistory
      );
      if (ancestorDistance === NO_ANCESTOR) {
        debug(`Node ${node} has no shared blocks with reference node`);
        events.push({
          type: "PEER",
          kind: "NODE_ON_A_BRANCH",
          node,
          message: `Node ${node} is on a branch`,
        });
      } else {
        debug(
          `Node ${node} is ${ancestorDistance} blocks away from reference node`
        );
      }
    }
  } else {
    warn(`Unable to check bootstrapped status for ${node}`);
  }
  if (nodeInfo.peerCount < minimumPeers) {
    const message = `Node ${node} has too few peers: ${nodeInfo.peerCount}/${minimumPeers}`;
    debug(message);
    events.push({
      type: "PEER",
      kind: "NODE_LOW_PEERS",
      node,
      message,
    });
  }

  return events;
};

const NO_ANCESTOR = -1;

const findSharedAncestor = (
  nodeHistory: BlockHeaderResponse[],
  referenceNodeHistory: BlockHeaderResponse[]
): number => {
  for (let i = 0; i < nodeHistory.length; i++) {
    const nodeHeader = nodeHistory[i];
    const referenceIndex = referenceNodeHistory.findIndex(
      (header) => header.hash === nodeHeader.hash
    );
    if (referenceIndex !== -1) return referenceIndex;
  }

  return NO_ANCESTOR;
};

export type BootstrappedStatus = {
  bootstrapped: boolean;
  sync_state: "synced" | "unsynced" | "stuck";
};

const isBootstrapped = async (
  node: string,
  chain: string
): Promise<BootstrappedStatus> => {
  const url = `${node}/chains/${chain}/is_bootstrapped`;
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

type FetchBlockHeadersArgs = {
  blockHash: string;
  rpc: RpcClient;
};

const branchHistoryLength = 5;

const fetchBlockHeaders = async ({
  blockHash,
  rpc,
}: FetchBlockHeadersArgs): Promise<Result<BlockHeaderResponse[]>> => {
  const history: BlockHeaderResponse[] = [];
  let nextHash = blockHash;
  // very primitive approach: we simply iterate up our chain to find the most recent blocks
  while (history.length < branchHistoryLength) {
    const [headerError, headerResult] = await to(
      rpc.getBlockHeader({ block: nextHash })
    );
    if (headerResult) {
      nextHash = headerResult.predecessor;
      history.push(headerResult);
    } else {
      debug(headerError);
      return {
        type: "ERROR",
        message: `Error fetching header for block ${blockHash}`,
      };
    }
  }

  return { type: "SUCCESS", data: history };
};

export type NetworkConnection = {
  incoming: boolean;
  peer_id: string;
  id_point: { addr: string; port: number };
  remote_socket_port: number;
  announced_version: {
    chain_name: string;
    distributed_db_version: number;
    p2p_version: number;
  };
  private: boolean;
  local_metadata: { disable_mempool: boolean; private_node: boolean };
  remote_metadata: { disable_mempool: boolean; private_node: boolean };
};

const getNetworkConnections = async (
  node: string
): Promise<NetworkConnection[]> => {
  const url = `${node}/network/connections`;
  const response = await fetch(url);
  return response.json();
};
