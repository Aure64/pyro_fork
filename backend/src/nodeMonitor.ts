import { Event, Events, RpcEvent, NodeEvent } from "./events";
import { getLogger, Logger } from "loglevel";
import { BlockHeader } from "./rpc/types";
import { readJson } from "./fs-utils";

import { BootstrappedStatus } from "./rpc/types";
import { TezosVersion } from "./rpc/types";

import client, { RpcClient, RpcClientConfig } from "./rpc/client";

import { get as rpcFetch } from "./rpc/util";

import * as service from "./service";
import now from "./now";

type URL = string;

export type NodeMonitorConfig = {
  nodes: URL[];
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

export const create = async (
  onEvent: (event: Event) => Promise<void>,
  {
    nodes,
    teztnets,
    teztnets_config: teztnetsConfig,
    low_peer_count: lowPeerCount,
  }: NodeMonitorConfig,
  rpcConfig: RpcClientConfig
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

  //dedup
  const nodeSet = [...new Set([...nodes, ...teztnetsNodes])];

  const allSubs = nodeSet.map((node) =>
    subscribeToNode(node, rpcConfig, onEvent, lowPeerCount)
  );

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
  rpcConfig: RpcClientConfig,
  onEvent: (event: Event) => Promise<void>,
  lowPeerCount: number
): Sub => {
  const rpc = client(node, rpcConfig);

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
    } catch (err: any) {
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
  } catch (err: any) {
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
      } catch (err: any) {
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
      } catch (err: any) {
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
      } catch (err: any) {
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
  lowPeerCount: number;
  log?: Logger;
};

/**
 * Analyze the provided node info for any significant events.
 */
export const checkBlockInfo = ({
  nodeInfo,
  previousNodeInfo,
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
