import { Result, PeerDataEvent, TezosNodeEvent } from "./types";
import { debug, warn, info } from "loglevel";
import { BlockHeaderResponse, RpcClient } from "@taquito/rpc";
import fetch from "cross-fetch";
import { wrap } from "./networkWrapper";
import { makeMemoizedAsyncFunction } from "./memoization";

const CHAIN = "main";

type Monitor = {
  nodes: string[];
  halt: () => void;
};

type StartArgs = {
  nodes: string[];
  onEvent: (event: TezosNodeEvent) => void;
  referenceNode: string;
};

const sleep = (milliseconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

export const start = ({
  nodes,
  onEvent,
  referenceNode,
}: StartArgs): Monitor => {
  const referenceSubscription = subscribeToNode(
    referenceNode,
    onEvent,
    () => undefined
  );

  const subscriptions = nodes.map((node) =>
    subscribeToNode(node, onEvent, referenceSubscription.nodeInfo)
  );

  const halt = () => {
    info("Halting node monitor");
    referenceSubscription.close();
    for (const subscription of subscriptions) {
      subscription.close();
    }
  };

  const monitor: Monitor = {
    nodes,
    halt,
  };

  debug(`Node monitor started`);

  return monitor;
};

type Sub = {
  close: () => void;
  nodeInfo: () => NodeInfo | undefined;
};

const subscribeToNode = (
  node: string,
  onEvent: (event: TezosNodeEvent) => void,
  getReference: () => NodeInfo | undefined
): Sub => {
  const rpc = new RpcClient(node);
  rpc.getBlockHeader = makeMemoizedAsyncFunction(
    rpc.getBlockHeader.bind(rpc),
    ({ block }: { block: string }) => `${block}`
  );

  let nodeData: NodeInfo | undefined;

  let halted = false;

  (async () => {
    while (!halted) {
      try {
        const headHash = await rpc.getBlockHash();

        const previousNodeInfo = nodeData;
        // skip checking boostrapped status if previous check failed
        const fetchBootstrappedStatus =
          previousNodeInfo === undefined ||
          previousNodeInfo.bootstrappedStatus !== undefined;
        const nodeInfoResult = await updateNodeInfo({
          node,
          blockHash: headHash,
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
            referenceNodeBlockHistory: getReference()?.history,
          });
          events.map(onEvent);
          // storing previous info in memory for now.  Eventually this will need to be persisted to the DB
          // with other data (eg current block)
          nodeData = nodeInfo;
        }
      } catch (err) {
        warn(`Node subscription error: ${err.message}`);
        onEvent({
          type: "PEER_DATA",
          kind: "ERROR",
          message: err.message,
        });
      }
      await sleep(30 * 1e3);
    }
  })();

  return {
    close: () => {
      halted = true;
    },
    nodeInfo: () => nodeData,
  };
};

export type NodeInfo = {
  head: string;
  bootstrappedStatus: BootstrappedStatus | undefined;
  history: BlockHeaderResponse[];
  peerCount: number | undefined;
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
  let bootstrappedStatus;

  if (fetchBootstrappedStatus) {
    const bootstrappedResult = await wrap(() =>
      getBootstrappedStatus(node, CHAIN)
    );

    if (bootstrappedResult.type === "ERROR") {
      warn(
        `isBoostrapped failed for node ${node} because of ${bootstrappedResult.error.message}`
      );
      //return { type: "ERROR", message: bootstrappedResult.error.message };
    } else {
      bootstrappedStatus = bootstrappedResult.data;
      debug(`Node ${node} bootstrap status: `, bootstrappedStatus);
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

  const connectionResult = await wrap(() => getNetworkConnections(node));
  let peerCount;
  if (connectionResult.type === "ERROR") {
    warn(
      `getNetworkConnections failed for node ${node} because of ${connectionResult.error.message}`
    );
    //return { type: "ERROR", message: connectionResult.error.message };
  } else {
    peerCount = connectionResult.data.length;
    debug(`Node ${node} has ${peerCount} peers`);
  }

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
      nodeInfo.bootstrappedStatus.sync_state === "synced"
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
  if (nodeInfo.peerCount !== undefined && nodeInfo.peerCount < minimumPeers) {
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
  // walk back through a node's blocks
  for (let i = 0; i < nodeHistory.length; i++) {
    const nodeHeader = nodeHistory[i];
    // look for the same block in our reference node
    const referenceIndex = referenceNodeHistory.findIndex(
      (header) => header.hash === nodeHeader.hash
    );
    // if one was found, that index is the distance our node is from the assumed main branch
    if (referenceIndex !== -1) return referenceIndex;
  }

  return NO_ANCESTOR;
};

export type BootstrappedStatus = {
  bootstrapped: boolean;
  sync_state: "synced" | "unsynced" | "stuck";
};

const getBootstrappedStatus = async (
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

const BRANCH_HISTORY_LENGTH = 5;

const fetchBlockHeaders = async ({
  blockHash,
  rpc,
}: FetchBlockHeadersArgs): Promise<Result<BlockHeaderResponse[]>> => {
  const history: BlockHeaderResponse[] = [];
  let nextHash = blockHash;
  // very primitive approach: we simply iterate up our chain to find the most recent blocks
  while (history.length < BRANCH_HISTORY_LENGTH) {
    const headerResult = await wrap(() =>
      rpc.getBlockHeader({ block: nextHash })
    );
    if (headerResult.type === "SUCCESS") {
      nextHash = headerResult.data.predecessor;
      history.push(headerResult.data);
    } else {
      debug(headerResult.error);
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
