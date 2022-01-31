import { getLogger } from "loglevel";
// import { HttpResponseError } from "@taquito/http-utils";
import { delay } from "../delay";
// import fetch from "cross-fetch";
import LRU from "lru-cache";

import { makeMemoizedAsyncFunction } from "../memoization";

import { RpcClient as TaquitoRpcClient } from "@taquito/rpc";

import type { BlockHeaderResponse } from "@taquito/rpc";

import { get as rpcFetch } from "./util";
import { retry404 } from "./util";

import NetworkConnection from "./types/NetworkConnection";
import TezosVersion from "./types/TezosVersion";
import BootstrappedStatus from "./types/BootstrappedStatus";
import EndorsingRightsH from "./types/PtHangz2aRng/EndorsingRights";
import EndorsingRightsI from "./types/Psithaca2MLR/EndorsingRights";
import ConstantsH from "./types/PtHangz2aRng/Constants";
import ConstantsI from "./types/Psithaca2MLR/Constants";

import { E_NETWORK_CONNECTIONS } from "./urls";
import { E_TEZOS_VERSION } from "./urls";
import { E_IS_BOOTSTRAPPED } from "./urls";
import { E_ENDORSING_RIGHTS } from "./urls";
import { E_CONSTANTS } from "./urls";
import { delegatesUrl } from "./urls";

interface RPCOptions {
  block: string;
}

type TzAddress = string;

type URL = string;

interface WithPayloadRound {
  payload_round: number;
}

export const getNetworkConnections = async (
  node: string
): Promise<NetworkConnection[]> => {
  return await rpcFetch(`${node}/${E_NETWORK_CONNECTIONS}`);
};

export const getTezosVersion = async (node: string): Promise<TezosVersion> => {
  return await rpcFetch(`${node}/${E_TEZOS_VERSION}`);
};

export const getBootstrappedStatus = async (
  node: string
): Promise<BootstrappedStatus> => {
  return await rpcFetch(`${node}/${E_IS_BOOTSTRAPPED}`);
};

const getEndorsingRights = async (
  node: string,
  block: string,
  level?: number
): Promise<EndorsingRightsH | EndorsingRightsI> => {
  const params = level === undefined ? undefined : { level: level.toString() };
  return await rpcFetch(`${node}/${E_ENDORSING_RIGHTS(block, params)}`);
};

const getConstants = async (node: string): Promise<ConstantsH | ConstantsI> => {
  return await rpcFetch(`${node}/${E_CONSTANTS("head")}`);
};

export type RpcClient = {
  url: URL;
  getTezosVersion: () => Promise<TezosVersion>;
  getBootsrappedStatus: () => Promise<BootstrappedStatus>;
  getNetworkConnections: () => Promise<NetworkConnection[]>;
  getBlockHeader: (options?: RPCOptions) => Promise<BlockHeaderResponse>;
  getBlockHash: (options?: RPCOptions) => Promise<string>;
  getBlockHistory: (
    blockHash: string,
    length?: number
  ) => Promise<BlockHeaderResponse[]>;
  getBalance: (pkh: TzAddress, block?: string) => Promise<string>;
  getFrozenBalance: (pkh: TzAddress, block?: string) => Promise<string>;
  getStakingBalance: (pkh: TzAddress, block?: string) => Promise<string>;
  getGracePeriod: (pkh: TzAddress, block?: string) => Promise<number>;
  getDeactivated: (pkh: TzAddress, block?: string) => Promise<boolean>;
  getEndorsingRights: (
    block?: string,
    level?: number
  ) => Promise<EndorsingRightsH | EndorsingRightsI>;
  getConstants: () => Promise<ConstantsH | ConstantsI>;
};

export default (nodeRpcUrl: URL): RpcClient => {
  const rpc = new TaquitoRpcClient(nodeRpcUrl);
  const log = getLogger("rpc");

  const origGetBlockReader = rpc.getBlockHeader.bind(rpc);
  rpc.getBlockHeader = makeMemoizedAsyncFunction(
    (async (options?: RPCOptions): Promise<BlockHeaderResponse> => {
      const b = await origGetBlockReader(options);
      return (b.priority === null || b.priority === undefined) &&
        "payload_round" in b
        ? {
            ...b,
            priority: (b as unknown as WithPayloadRound).payload_round,
          }
        : b;
    }).bind(rpc),
    ({ block }: { block: string }) =>
      block.toLowerCase().startsWith("head") ? null : block,
    10
  );

  const delegateCache = new LRU<string, any>({
    max: 5 * 25,
    maxAge: 60e3,
  });
  const fetchDelegateField = async (
    pkh: TzAddress,
    block: string,
    field: string
  ) => {
    const cacheKey = `${block}:${pkh}:${field}`;
    let value = delegateCache.get(cacheKey);
    if (value === undefined) {
      //when status UI page loads/refreshes, GraphQL results in a lot
      //of requests going out at the same time, up to number of bakers
      //on page times 5 delegate fields if server just started and
      //cache is empty... need to spread out these requests a bit,
      //otherwise some nodes are not able to handle it
      const d = 200 * Math.random();
      log.debug("Random delay", d);
      await delay(d);
      const dt = Date.now();
      value = await rpcFetch(
        `${delegatesUrl(nodeRpcUrl, pkh, block)}/${field}`
      );
      log.debug(`got value for ${cacheKey} in ${Date.now() - dt}`);
      //cache requests using block id relative to head for a few
      //minutes, with different ttls so avoid request bursts when they
      //all expire at the same time this means displayed balances may
      //be slightly stale
      delegateCache.set(cacheKey, value, 60e3 * (1 + 3 * Math.random()));
    } else {
      log.debug(
        `CACHE HIT: '${value}' under ${cacheKey} (${delegateCache.itemCount} items cached)`
      );
    }
    return value;
  };

  const tezosVersionCache = new LRU<string, TezosVersion>({ maxAge: 5 * 60e3 });

  const fetchTezosVersion = async () => {
    let tezosVersion = tezosVersionCache.get("value");
    if (!tezosVersion) {
      tezosVersion = await getTezosVersion(nodeRpcUrl);
      tezosVersionCache.set("value", tezosVersion);
    }

    return tezosVersion;
  };

  const fetchBlockHeaders = async (
    blockHash: string,
    rpc: TaquitoRpcClient,
    length: number
  ): Promise<BlockHeaderResponse[]> => {
    const history: BlockHeaderResponse[] = [];
    let nextHash = blockHash;
    // very primitive approach: we simply iterate up our chain to find the most recent blocks
    while (history.length < length) {
      const header = await retry404(() =>
        rpc.getBlockHeader({ block: nextHash })
      );
      nextHash = header.predecessor;
      history.push(header);
    }
    return history;
  };

  return {
    url: nodeRpcUrl,
    getTezosVersion: fetchTezosVersion,
    getBootsrappedStatus: () => getBootstrappedStatus(nodeRpcUrl),
    getNetworkConnections: () => getNetworkConnections(nodeRpcUrl),
    getEndorsingRights: (block = "head", level?: number) => {
      return getEndorsingRights(nodeRpcUrl, block, level);
    },

    getConstants: () => getConstants(nodeRpcUrl),

    getBlockHeader: (options?: RPCOptions) => {
      return rpc.getBlockHeader(options);
    },

    getBlockHash: (options?: RPCOptions) => {
      return rpc.getBlockHash(options);
    },

    getBlockHistory: (blockHash: string, length = 5) => {
      return fetchBlockHeaders(blockHash, rpc, length);
    },

    getBalance: (pkh: TzAddress, block = "head") => {
      return fetchDelegateField(pkh, block, "balance");
    },

    getFrozenBalance: (pkh: TzAddress, block = "head") => {
      return fetchDelegateField(pkh, block, "frozen_balance");
    },

    getStakingBalance: (pkh: TzAddress, block = "head") => {
      return fetchDelegateField(pkh, block, "staking_balance");
    },

    getGracePeriod: (pkh: TzAddress, block = "head") => {
      return fetchDelegateField(pkh, block, "grace_period");
    },

    getDeactivated: (pkh: TzAddress, block = "head") => {
      return fetchDelegateField(pkh, block, "deactivated");
    },
  };
};
