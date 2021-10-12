//import { PeerEvent, TezosNodeEvent } from "./types";
import { Event, Events, RpcEvent, NodeEvent } from "./events";
import { getLogger, Logger } from "loglevel";
import { BlockHeaderResponse, RpcClient } from "@taquito/rpc";
import fetch from "cross-fetch";
import { retry404 } from "./networkWrapper";
import { makeMemoizedAsyncFunction } from "./memoization";

import { HttpResponseError } from "@taquito/http-utils";

import * as service from "./service";
import now from "./now";

type URL = string;

export type NodeMonitorConfig = {
  nodes: URL[];
  reference_node?: URL;
};

export type NodeInfo = {
  url: string;
  head: string;
  bootstrappedStatus: BootstrappedStatus | undefined;
  history: BlockHeaderResponse[];
  peerCount: number | undefined;
};

type NodeInfoProvider = { nodeInfo: () => NodeInfo | undefined };

type Sub = service.Service & NodeInfoProvider;

export type NodeInfoCollection = { info: () => NodeInfo[] };

export type NodeMonitor = service.Service & NodeInfoCollection;

const NoSub: Sub = {
  name: "no-sub",
  start: () => Promise.resolve(),
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  stop: () => {},
  nodeInfo: () => undefined,
};

export const create = (
  onEvent: (event: Event) => Promise<void>,
  { nodes, reference_node: referenceNode }: NodeMonitorConfig
): NodeMonitor => {
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

  const info = () => {
    return allSubs.map((s) => s.nodeInfo()).filter((x): x is NodeInfo => !!x);
  };

  return { name: "nm", start, stop, info };
};

const eventKey = (event: RpcEvent | NodeEvent): string => {
  if (event.kind === Events.RpcError) {
    return `${event.kind}:${event.message}`;
  }
  return event.kind;
};

const subscribeToNode = (
  node: string,
  onEvent: (event: Event) => Promise<void>,
  getReference: () => NodeInfo | undefined
): Sub => {
  const rpc = new RpcClient(node);
  rpc.getBlockHeader = makeMemoizedAsyncFunction(
    rpc.getBlockHeader.bind(rpc),
    ({ block }: { block: string }) => `${block}`
  );

  const log = getLogger(`nm|${node}`);
  let nodeData: NodeInfo | undefined;
  let previousEvents: Set<string> = new Set();
  //let halted = false;
  let unableToReach: boolean | undefined;

  const task = async () => {
    let events: (NodeEvent | RpcEvent)[] = [];
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
        log,
      });
      events = checkBlockInfo({
        node,
        nodeInfo,
        previousNodeInfo,
        referenceNodeBlockHistory: getReference()?.history,
        log,
      });
      // storing previous info in memory for now.  Eventually this will need to be persisted to the DB
      // with other data (eg current block)
      nodeData = nodeInfo;
      log.debug("Unable to reach?", unableToReach);
      if (unableToReach) {
        log.debug("Adding reconnected event");
        events.push({
          kind: Events.RpcErrorResolved,
          node,
          createdAt: now(),
        });
      }
      unableToReach = false;
    } catch (err) {
      unableToReach = true;
      log.warn(`Node subscription error: ${err.message}`);
      log.debug("Unable to reach?", unableToReach);
      events.push({
        kind: Events.RpcError,
        message: err.status
          ? `${node} returned ${err.status} ${err.statusText ?? ""}`
          : err.message,
        node,
        createdAt: now(),
      });
    }
    const publishedEvents = new Set<string>();
    for (const event of events) {
      const key = eventKey(event);
      if (previousEvents.has(key)) {
        log.debug(`Event ${key} is already reported, not publishing`);
      } else {
        log.debug(`Event ${key} is new, publishing`);
        await onEvent(event);
      }
      publishedEvents.add(key);
    }
    previousEvents = publishedEvents;
  };

  const srv = service.create(node, task, 30 * 1e3);

  return {
    name: srv.name,
    start: srv.start,
    stop: srv.stop,
    nodeInfo: () => nodeData,
  };
};

const updateNodeInfo = async ({
  node,
  blockHash,
  rpc,
  fetchBootstrappedStatus,
  fetchNetworkConnections,
  log,
}: {
  node: string;
  blockHash: string;
  rpc: RpcClient;
  fetchBootstrappedStatus: boolean;
  fetchNetworkConnections: boolean;
  log?: Logger;
}): Promise<NodeInfo> => {
  if (!log) log = getLogger(__filename);
  log.debug(`Checking block ${blockHash}`);
  let bootstrappedStatus;

  if (fetchBootstrappedStatus) {
    try {
      bootstrappedStatus = await retry404(() => getBootstrappedStatus(node));
      log.debug(`bootstrap status:`, bootstrappedStatus);
    } catch (err) {
      log.warn(`Unable to get bootsrap status`, err);
    }
  }

  const history = await fetchBlockHeaders({ blockHash, rpc });

  let peerCount;
  if (fetchNetworkConnections) {
    try {
      const connections = await retry404(() => getNetworkConnections(node));
      peerCount = connections.length;
      log.debug(`Node has ${peerCount} peers`);
    } catch (err) {
      log.warn(`Unable to get network connections info`, err);
    }
  }

  return {
    url: node,
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
  log?: Logger;
};

/**
 * Analyze the provided node info for any significant events.
 */
export const checkBlockInfo = ({
  node,
  nodeInfo,
  previousNodeInfo,
  referenceNodeBlockHistory,
  log,
}: CheckBlockInfoArgs): NodeEvent[] => {
  if (!log) log = getLogger(__filename);
  const events: NodeEvent[] = [];
  type ValueOf<T> = T[keyof T];
  const newEvent = (kind: ValueOf<Pick<NodeEvent, "kind">>): NodeEvent => {
    return { kind, node, createdAt: now() };
  };

  if (nodeInfo.bootstrappedStatus) {
    if (
      nodeInfo.bootstrappedStatus.bootstrapped &&
      nodeInfo.bootstrappedStatus.sync_state !== "synced"
    ) {
      log.debug(`Node is behind`);
      if (
        previousNodeInfo &&
        previousNodeInfo.bootstrappedStatus?.sync_state !== "synced"
      ) {
        log.debug("Node was not synced already, not generating event");
      } else {
        events.push(newEvent(Events.NodeBehind));
      }
    } else if (
      catchUpOccurred(
        previousNodeInfo?.bootstrappedStatus,
        nodeInfo.bootstrappedStatus
      )
    ) {
      log.debug(`Node caught up`);
      events.push(newEvent(Events.NodeSynced));
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
        log.debug(`Node has no shared blocks with reference node`);
        events.push(newEvent(Events.NodeOnBranch));
      } else {
        log.debug(`${ancestorDistance} blocks away from reference node`);
      }
    }
  } else {
    log.warn(`Unable to check bootstrapped status`);
  }
  if (nodeInfo.peerCount !== undefined && nodeInfo.peerCount < minimumPeers) {
    if (
      previousNodeInfo?.peerCount !== undefined &&
      previousNodeInfo.peerCount < minimumPeers
    ) {
      log.debug("Node previously had too few peers, not generating event");
    } else {
      const message = `Node ${node} has too few peers: ${nodeInfo.peerCount}/${minimumPeers}`;
      log.debug(message);
      events.push(newEvent(Events.NodeLowPeers));
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
    const header = await retry404(() =>
      rpc.getBlockHeader({ block: nextHash })
    );
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
