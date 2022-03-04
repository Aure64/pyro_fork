import { Event, Events, RpcEvent, NodeEvent } from "./events";
import { getLogger, Logger } from "loglevel";
//import { BlockHeaderResponse } from "@taquito/rpc";
import { BlockHeader } from "./rpc/types";
import { readJson } from "./fs-utils";

import { BootstrappedStatus } from "./rpc/types";
import { TezosVersion } from "./rpc/types";

import client, { RpcClient } from "./rpc/client";

import { get as rpcFetch } from "./rpc/util";

import * as service from "./service";
import now from "./now";

type URL = string;

export type NodeMonitorConfig = {
  nodes: URL[];
  reference_node?: URL;
  teztnets?: boolean;
  teztnets_config: string;
  low_peer_count: number;
};

export type NodeCommunicationError = {
  message: string;
  status?: string;
  statusText?: string;
};

export type EndpointsAvailability = {
  status: boolean;
  networkConnections: boolean;
  version: boolean;
};

export type NodeInfo = {
  url: string;
  head: string | undefined;
  endpoints: EndpointsAvailability;
  bootstrappedStatus: BootstrappedStatus | undefined;
  history: BlockHeader[];
  peerCount: number | undefined;
  updatedAt: Date;
  unableToReach: boolean;
  error: NodeCommunicationError | undefined;
  tezosVersion: TezosVersion | undefined;
};

type NodeInfoProvider = { nodeInfo: () => NodeInfo | undefined };

type Sub = service.Service & NodeInfoProvider;

export type NodeInfoCollection = { info: () => Promise<NodeInfo[]> };

export type NodeMonitor = service.Service & NodeInfoCollection;

const NoSub: Sub = {
  name: "no-sub",
  start: () => Promise.resolve(),
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  stop: () => {},
  nodeInfo: () => undefined,
};

export const create = async (
  onEvent: (event: Event) => Promise<void>,
  {
    nodes,
    reference_node: referenceNode,
    teztnets,
    teztnets_config: teztnetsConfig,
    low_peer_count: lowPeerCount,
  }: NodeMonitorConfig
): Promise<NodeMonitor> => {
  const teztnetsNodes: string[] = [];
  if (teztnets) {
    try {
      const read =
        teztnetsConfig.startsWith("https:") ||
        teztnetsConfig.startsWith("http:")
          ? rpcFetch
          : readJson;
      const testNets = await read(teztnetsConfig);
      for (const [networkName, data] of Object.entries<any>(testNets)) {
        if ("rpc_url" in data) {
          teztnetsNodes.push(data.rpc_url);
        } else {
          getLogger("nm").warn(
            `Network ${networkName} has no rpc URL, skipping`,
            data
          );
        }
      }
    } catch (err) {
      getLogger("nm").error(
        `Unable to get teztnets config from ${teztnetsConfig}`,
        err
      );
    }
  }

  const nodeSet = new Set([...nodes, ...teztnetsNodes]);
  if (referenceNode) {
    nodeSet.delete(referenceNode);
  }
  //dedup
  nodes = [...nodeSet];

  const referenceSubscription = referenceNode
    ? subscribeToNode(referenceNode, onEvent, () => undefined, lowPeerCount)
    : NoSub;

  const subscriptions = nodes.map((node) =>
    subscribeToNode(node, onEvent, referenceSubscription.nodeInfo, lowPeerCount)
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

  const info = async () => {
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

const initialEndpointAvailability = {
  status: true,
  networkConnections: true,
  version: true,
};

const subscribeToNode = (
  node: string,
  onEvent: (event: Event) => Promise<void>,
  getReference: () => NodeInfo | undefined,
  lowPeerCount: number
): Sub => {
  const rpc = client(node);

  const log = getLogger(`nm|${node}`);
  let nodeData: NodeInfo = {
    url: node,
    endpoints: initialEndpointAvailability,
    unableToReach: false,
    head: undefined,
    peerCount: undefined,
    bootstrappedStatus: undefined,
    tezosVersion: undefined,
    error: undefined,
    updatedAt: new Date(),
    history: [],
  };
  let previousEvents: Set<string> = new Set();

  const task = async () => {
    let events: (NodeEvent | RpcEvent)[] = [];
    try {
      const previousNodeInfo = nodeData;

      const nodeInfo = await updateNodeInfo({
        node,
        rpc,
        endpoints: previousNodeInfo.endpoints,
        log,
      });
      if (nodeInfo.unableToReach) {
        log.debug("Unable to reach node");
        const err = nodeInfo.error;
        const message = err
          ? err.status
            ? `${node} returned ${err.status} ${err.statusText ?? ""}`
            : err?.message
          : "Unknown error";
        events.push({
          kind: Events.RpcError,
          message,
          node,
          createdAt: now(),
        });
      } else {
        events = checkBlockInfo({
          nodeInfo,
          previousNodeInfo,
          referenceNodeBlockHistory: getReference()?.history,
          lowPeerCount,
          log,
        });
      }

      // storing previous info in memory for now.  Eventually this will need to be persisted to the DB
      // with other data (eg current block)
      nodeData = nodeInfo;
      if (previousNodeInfo.unableToReach && !nodeInfo.unableToReach) {
        log.debug("Adding reconnected event");
        events.push({
          kind: Events.RpcErrorResolved,
          node,
          createdAt: now(),
        });
      }
    } catch (err) {
      log.warn(`Node subscription error: ${err.message}`);
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

const UNAVAILABLE_RPC_HTTP_STATUS = [401, 403, 404];

const updateNodeInfo = async ({
  node,
  rpc,
  endpoints,
  log,
}: {
  node: string;
  rpc: RpcClient;
  endpoints: EndpointsAvailability;
  log?: Logger;
}): Promise<NodeInfo> => {
  if (!log) log = getLogger(__filename);

  let unableToReach = false;
  let history: BlockHeader[];
  let error: NodeCommunicationError | undefined;
  let blockHash;
  try {
    blockHash = await rpc.getBlockHash();
    log.debug(`Checking block ${blockHash}`);
    history = await rpc.getBlockHistory(blockHash);
  } catch (err) {
    const logMessage = blockHash
      ? `Unable to get block history for ${blockHash}: `
      : `Unable to get head block hash: `;
    let logStruct;
    if (err.name === "HttpRequestFailed") {
      logStruct = err.message;
    } else {
      logStruct = err;
    }
    log.warn(logMessage, logStruct);
    unableToReach = true;
    error = err;
    history = [];
  }

  let hasNetworkConnectionsEndpoint = endpoints.networkConnections;
  let hasStatusEndpoint = endpoints.status;
  let hasVersionEndpoint = endpoints.version;

  let bootstrappedStatus;
  let peerCount;
  let tezosVersion;

  if (!unableToReach) {
    if (endpoints.status) {
      try {
        bootstrappedStatus = await rpc.getBootsrappedStatus();
        log.debug(`bootstrap status:`, bootstrappedStatus);
      } catch (err) {
        log.warn(`Unable to get bootsrap status`, err);
        if (UNAVAILABLE_RPC_HTTP_STATUS.includes(err.status)) {
          hasStatusEndpoint = false;
        }
      }
    }

    if (endpoints.networkConnections) {
      try {
        const connections = await rpc.getNetworkConnections();
        peerCount = connections.length;
        log.debug(`Node has ${peerCount} peers`);
      } catch (err) {
        log.warn(`Unable to get network connections info`, err);
        if (UNAVAILABLE_RPC_HTTP_STATUS.includes(err.status)) {
          hasNetworkConnectionsEndpoint = false;
        }
      }
    }

    if (endpoints.version) {
      try {
        tezosVersion = await rpc.getTezosVersion();
        log.debug(`Tezos version:`, tezosVersion);
      } catch (err) {
        log.warn(`Unable to get tezos version info`, err);
        if (UNAVAILABLE_RPC_HTTP_STATUS.includes(err.status)) {
          hasVersionEndpoint = false;
        }
      }
    }
  }
  return {
    url: node,
    endpoints: {
      status: hasStatusEndpoint,
      networkConnections: hasNetworkConnectionsEndpoint,
      version: hasVersionEndpoint,
    },
    head: blockHash,
    bootstrappedStatus,
    history,
    peerCount,
    tezosVersion,
    unableToReach,
    error,
    updatedAt: new Date(),
  };
};

type CheckBlockInfoArgs = {
  nodeInfo: NodeInfo;
  previousNodeInfo: NodeInfo | undefined;
  referenceNodeBlockHistory: BlockHeader[] | undefined;
  lowPeerCount: number;
  log?: Logger;
};

/**
 * Analyze the provided node info for any significant events.
 */
export const checkBlockInfo = ({
  nodeInfo,
  previousNodeInfo,
  referenceNodeBlockHistory,
  lowPeerCount,
  log,
}: CheckBlockInfoArgs): NodeEvent[] => {
  if (!log) log = getLogger(__filename);
  const events: NodeEvent[] = [];
  type ValueOf<T> = T[keyof T];
  const newEvent = (kind: ValueOf<Pick<NodeEvent, "kind">>): NodeEvent => {
    return { kind, node: nodeInfo.url, createdAt: now() };
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
  if (nodeInfo.peerCount !== undefined) {
    if (nodeInfo.peerCount <= lowPeerCount) {
      if (
        previousNodeInfo?.peerCount !== undefined &&
        previousNodeInfo.peerCount <= lowPeerCount
      ) {
        log.debug("Node previously had too few peers, not generating event");
      } else {
        log.debug(
          `${nodeInfo.url} has low peer count: ${nodeInfo.peerCount}/${lowPeerCount}`
        );
        events.push(newEvent(Events.NodeLowPeers));
      }
    }

    if (nodeInfo.peerCount > lowPeerCount) {
      if (
        previousNodeInfo?.peerCount !== undefined &&
        previousNodeInfo.peerCount <= lowPeerCount
      ) {
        log.debug(
          `${nodeInfo.url} low peer count resolved: ${nodeInfo.peerCount}/${lowPeerCount}`
        );
        events.push(newEvent(Events.NodeLowPeersResolved));
      } else {
        log.debug("Node previously had enough peers, not generating event");
      }
    }
  }

  return events;
};

const NO_ANCESTOR = -1;

const findSharedAncestor = (
  nodeHistory: BlockHeader[],
  referenceNodeHistory: BlockHeader[]
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
