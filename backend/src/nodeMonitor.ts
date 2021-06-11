import { PeerEvent, TezosNodeEvent } from "./types";
import { debug, warn, info } from "loglevel";
import { BlockHeaderResponse, RpcClient } from "@taquito/rpc";
import fetch from "cross-fetch";
import { wrap2 } from "./networkWrapper";
import { makeMemoizedAsyncFunction } from "./memoization";

import { HttpResponseError } from "@taquito/http-utils";

// import { delay } from "./delay";

import * as service from "./service";

type Monitor = {
  nodes: string[];
  halt: () => void;
};

type StartArgs = {
  nodes: string[];
  onEvent: (event: TezosNodeEvent) => Promise<void>;
  referenceNode?: string;
};

type NodeInfoProvider = { nodeInfo: () => NodeInfo | undefined };

type Sub = service.Service & NodeInfoProvider;

// eslint-disable-next-line @typescript-eslint/no-empty-function
const NoSub: Sub = {
  name: "no-sub",
  start: () => Promise.resolve(),
  stop: () => {},
  nodeInfo: () => undefined,
};

export const create = (
  onEvent: (event: TezosNodeEvent) => Promise<void>,
  nodes: string[],
  referenceNode?: string
): service.Service => {
  const referenceSubscription = referenceNode
    ? subscribeToNode(referenceNode, onEvent, () => undefined)
    : NoSub;

  const subscriptions = nodes.map((node) =>
    subscribeToNode(node, onEvent, referenceSubscription.nodeInfo)
  );

  const allSubs = [...subscriptions, referenceSubscription];

  const start = async () => {
    await Promise.all(allSubs.map((s) => s.start()));
  };

  const stop = () => {
    for (const s of allSubs) {
      s.stop();
    }
  };

  return { name: "nm", start, stop };
};

const eventKey = (event: PeerEvent): string => {
  const { kind, type, message } = event;
  return `${kind}:${type}:${message}`;
};

const subscribeToNode = (
  node: string,
  onEvent: (event: TezosNodeEvent) => Promise<void>,
  getReference: () => NodeInfo | undefined
): Sub => {
  const rpc = new RpcClient(node);
  rpc.getBlockHeader = makeMemoizedAsyncFunction(
    rpc.getBlockHeader.bind(rpc),
    ({ block }: { block: string }) => `${block}`
  );

  let nodeData: NodeInfo | undefined;
  let previousEvents: Set<string> = new Set();
  //let halted = false;
  let unableToReach: boolean | undefined;

  const task = async () => {
    let events: PeerEvent[] = [];
    try {
      const headHash = await rpc.getBlockHash();

      const previousNodeInfo = nodeData;
      // skip checking boostrapped status if previous check failed
      const fetchBootstrappedStatus =
        previousNodeInfo === undefined ||
        previousNodeInfo.bootstrappedStatus !== undefined;
      // skip checking  network connections if previous check failed
      const fetchNetworkConnections =
        previousNodeInfo === undefined ||
        previousNodeInfo.peerCount !== undefined;

      const nodeInfo = await updateNodeInfo({
        node,
        blockHash: headHash,
        rpc,
        fetchBootstrappedStatus,
        fetchNetworkConnections,
      });
      events = checkBlockInfo({
        node,
        nodeInfo,
        previousNodeInfo,
        referenceNodeBlockHistory: getReference()?.history,
      });
      // storing previous info in memory for now.  Eventually this will need to be persisted to the DB
      // with other data (eg current block)
      nodeData = nodeInfo;
      debug("Unable to reach?", unableToReach);
      if (unableToReach) {
        debug("Adding reconnected event");
        events.push({
          type: "PEER_DATA",
          kind: "RECONNECTED",
          message: `Connectivity to ${node} restored`,
          node,
        });
      }
      unableToReach = false;
    } catch (err) {
      unableToReach = true;
      warn(`Node subscription error: ${err.message}`);
      debug("Unable to reach?", unableToReach);
      events.push({
        type: "PEER_DATA",
        kind: "ERROR",
        message: err.status
          ? `${node} returned ${err.status} ${err.statusText ?? ""}`
          : err.message,
        node,
      });
    }
    const publishedEvents = new Set<string>();
    for (const event of events) {
      const key = eventKey(event);
      if (previousEvents.has(key)) {
        debug(`Event ${key} is already reported, not publishing`);
      } else {
        debug(`Event ${key} is new, publishing`);
        await onEvent(event);
      }
      publishedEvents.add(key);
    }
    previousEvents = publishedEvents;
  };

  const srv = service.create(node, task, 30 * 1e3);

  // (async () => {
  //   while (!halted) {
  //     let events: PeerEvent[] = [];
  //     try {
  //       const headHash = await rpc.getBlockHash();

  //       const previousNodeInfo = nodeData;
  //       // skip checking boostrapped status if previous check failed
  //       const fetchBootstrappedStatus =
  //         previousNodeInfo === undefined ||
  //         previousNodeInfo.bootstrappedStatus !== undefined;
  //       // skip checking  network connections if previous check failed
  //       const fetchNetworkConnections =
  //         previousNodeInfo === undefined ||
  //         previousNodeInfo.peerCount !== undefined;

  //       const nodeInfo = await updateNodeInfo({
  //         node,
  //         blockHash: headHash,
  //         rpc,
  //         fetchBootstrappedStatus,
  //         fetchNetworkConnections,
  //       });
  //       events = checkBlockInfo({
  //         node,
  //         nodeInfo,
  //         previousNodeInfo,
  //         referenceNodeBlockHistory: getReference()?.history,
  //       });
  //       // storing previous info in memory for now.  Eventually this will need to be persisted to the DB
  //       // with other data (eg current block)
  //       nodeData = nodeInfo;
  //       debug("Unable to reach?", unableToReach);
  //       if (unableToReach) {
  //         debug("Adding reconnected event");
  //         events.push({
  //           type: "PEER_DATA",
  //           kind: "RECONNECTED",
  //           message: `Connectivity to ${node} restored`,
  //           node,
  //         });
  //       }
  //       unableToReach = false;
  //     } catch (err) {
  //       unableToReach = true;
  //       warn(`Node subscription error: ${err.message}`);
  //       debug("Unable to reach?", unableToReach);
  //       events.push({
  //         type: "PEER_DATA",
  //         kind: "ERROR",
  //         message: err.status
  //           ? `${node} returned ${err.status} ${err.statusText ?? ""}`
  //           : err.message,
  //         node,
  //       });
  //     }
  //     const publishedEvents = new Set<string>();
  //     for (const event of events) {
  //       const key = eventKey(event);
  //       if (previousEvents.has(key)) {
  //         debug(`Event ${key} is already reported, not publishing`);
  //       } else {
  //         debug(`Event ${key} is new, publishing`);
  //         await onEvent(event);
  //       }
  //       publishedEvents.add(key);
  //     }
  //     previousEvents = publishedEvents;
  //     await delay(30 * 1e3);
  //   }
  // })();

  return {
    name: srv.name,
    start: srv.start,
    stop: srv.stop,
    nodeInfo: () => nodeData,
  };
};

export type NodeInfo = {
  head: string;
  bootstrappedStatus: BootstrappedStatus | undefined;
  history: BlockHeaderResponse[];
  peerCount: number | undefined;
};

const updateNodeInfo = async ({
  node,
  blockHash,
  rpc,
  fetchBootstrappedStatus,
  fetchNetworkConnections,
}: {
  node: string;
  blockHash: string;
  rpc: RpcClient;
  fetchBootstrappedStatus: boolean;
  fetchNetworkConnections: boolean;
}): Promise<NodeInfo> => {
  debug(`Node monitor received block ${blockHash} for node ${node}`);
  let bootstrappedStatus;

  if (fetchBootstrappedStatus) {
    try {
      bootstrappedStatus = await wrap2(() => getBootstrappedStatus(node));
      debug(`Node ${node} bootstrap status: `, bootstrappedStatus);
    } catch (err) {
      warn(`Unable to get bootsrap status for node ${node}`, err);
    }
  }

  const history = await fetchBlockHeaders({ blockHash, rpc });

  let peerCount;
  if (fetchNetworkConnections) {
    try {
      const connections = await wrap2(() => getNetworkConnections(node));
      peerCount = connections.length;
      debug(`Node ${node} has ${peerCount} peers`);
    } catch (err) {
      warn(`Unable to get network connections info for node ${node}`, err);
    }
  }

  return {
    head: blockHash,
    bootstrappedStatus,
    history,
    peerCount,
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
}: CheckBlockInfoArgs): PeerEvent[] => {
  const events: PeerEvent[] = [];

  if (nodeInfo.bootstrappedStatus) {
    if (
      nodeInfo.bootstrappedStatus.bootstrapped &&
      nodeInfo.bootstrappedStatus.sync_state !== "synced"
    ) {
      debug(`Node ${node} is behind`);
      if (
        previousNodeInfo &&
        previousNodeInfo.bootstrappedStatus?.sync_state !== "synced"
      ) {
        debug("Node was not synced already, not generating event");
      } else {
        events.push({
          type: "PEER",
          kind: "NODE_BEHIND",
          node,
          message: "Node is behind",
        });
      }
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
    if (
      previousNodeInfo?.peerCount !== undefined &&
      previousNodeInfo.peerCount < minimumPeers
    ) {
      debug("Node previously had too few peers, not generating event");
    } else {
      const message = `Node ${node} has too few peers: ${nodeInfo.peerCount}/${minimumPeers}`;
      debug(message);
      events.push({
        type: "PEER",
        kind: "NODE_LOW_PEERS",
        node,
        message,
      });
    }
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

const rpcFetch = async (url: string) => {
  const response = await fetch(url);
  if (response.ok) {
    return response.json();
  }
  throw new HttpResponseError(
    `Http error response: (${response.status})`,
    response.status,
    response.statusText,
    await response.text(),
    url
  );
};

export type BootstrappedStatus = {
  bootstrapped: boolean;
  sync_state: "synced" | "unsynced" | "stuck";
};

const getBootstrappedStatus = async (
  node: string
): Promise<BootstrappedStatus> => {
  return await rpcFetch(`${node}/chains/main/is_bootstrapped`);
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
}: FetchBlockHeadersArgs): Promise<BlockHeaderResponse[]> => {
  const history: BlockHeaderResponse[] = [];
  let nextHash = blockHash;
  // very primitive approach: we simply iterate up our chain to find the most recent blocks
  while (history.length < BRANCH_HISTORY_LENGTH) {
    const header = await wrap2(() => rpc.getBlockHeader({ block: nextHash }));
    nextHash = header.predecessor;
    history.push(header);
  }
  return history;
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
  return await rpcFetch(`${node}/network/connections`);
};
