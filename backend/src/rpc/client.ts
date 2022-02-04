import { getLogger } from "loglevel";
import { delay } from "../delay";
import LRU from "lru-cache";

import { makeMemoizedAsyncFunction } from "../memoization";

import { get as rpcFetch } from "./util";
import { retry404 } from "./util";

import { NetworkConnection } from "./types";
import { TezosVersion } from "./types";
import { BootstrappedStatus } from "./types";
import { BlockHeader } from "./types";
import { Delegate } from "./types";

import { E_NETWORK_CONNECTIONS } from "./urls";
import { E_TEZOS_VERSION } from "./urls";
import { E_IS_BOOTSTRAPPED } from "./urls";
import { E_ENDORSING_RIGHTS } from "./urls";
import { E_BAKING_RIGHTS } from "./urls";
import { E_CONSTANTS } from "./urls";
import { E_CHAIN_ID } from "./urls";
import { E_BLOCK } from "./urls";
import { E_BLOCK_HEADER } from "./urls";
import { E_BLOCK_HASH } from "./urls";
import { E_DELEGATES_PKH } from "./urls";
import { delegatesUrl } from "./urls";

import { TzAddress } from "rpc/types";
import { URL } from "rpc/types";

import { Block } from "./types";
import { BakingRight } from "./types";
import { EndorsingRight } from "./types";
import { Constants } from "./types";

// interface WithPayloadRound {
//   payload_round: number;
// }

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
  level: number
): Promise<EndorsingRight[]> => {
  const params = { level: level.toString() };
  return await rpcFetch(`${node}/${E_ENDORSING_RIGHTS(block, params)}`);
};

const getBakingRights = async (
  node: string,
  block: string,
  level: number,
  max_priority?: number,
  delegate?: string
): Promise<BakingRight[]> => {
  const params: Record<string, string> = { level: level.toString() };
  if (level !== undefined) {
    params.level = level.toString();
  }
  if (max_priority !== undefined) {
    params.max_priority = max_priority.toString();
  }
  if (delegate !== undefined) {
    params.delegate = delegate;
  }
  return await rpcFetch(`${node}/${E_BAKING_RIGHTS(block, params)}`);
};

const getConstants = async (node: string): Promise<Constants> => {
  return await rpcFetch(`${node}/${E_CONSTANTS("head")}`);
};

const getChainId = async (node: string): Promise<string> => {
  return await rpcFetch(`${node}/${E_CHAIN_ID}`);
};

const getBlock = async (node: string, block: string): Promise<Block> => {
  return await rpcFetch(`${node}/${E_BLOCK(block)}`);
};

const getBlockHash = async (node: string, block: string): Promise<string> => {
  return await rpcFetch(`${node}/${E_BLOCK_HASH(block)}`);
};

const getBlockHeader = async (
  node: string,
  block: string
): Promise<BlockHeader> => {
  return await rpcFetch(`${node}/${E_BLOCK_HEADER(block)}`);
};

const getDelegate = async (
  node: string,
  pkh: string,
  block: string
): Promise<Delegate> => {
  return await rpcFetch(`${node}/${E_DELEGATES_PKH(block, pkh)}`);
};

export type RpcClient = {
  url: URL;
  getTezosVersion: () => Promise<TezosVersion>;
  getBootsrappedStatus: () => Promise<BootstrappedStatus>;
  getNetworkConnections: () => Promise<NetworkConnection[]>;
  getBlockHeader: (block: string) => Promise<BlockHeader>;
  getBlock: (block: string) => Promise<Block>;
  getBlockHash: (block?: string) => Promise<string>;
  getBlockHistory: (
    blockHash: string,
    length?: number
  ) => Promise<BlockHeader[]>;
  getBalance: (pkh: TzAddress, block?: string) => Promise<string>;
  getFrozenBalance: (pkh: TzAddress, block?: string) => Promise<string>;
  getStakingBalance: (pkh: TzAddress, block?: string) => Promise<string>;
  getGracePeriod: (pkh: TzAddress, block?: string) => Promise<number>;
  getDeactivated: (pkh: TzAddress, block?: string) => Promise<boolean>;
  getEndorsingRights: (
    block: string,
    level: number
  ) => Promise<EndorsingRight[]>;
  getBakingRights: (
    block: string,
    level: number,
    max_priority?: number,
    delegate?: string
  ) => Promise<BakingRight[]>;
  getConstants: () => Promise<Constants>;
  getChainId: () => Promise<string>;
  getDelegate: (pkh: TzAddress, block?: string) => Promise<Delegate>;
};

export default (nodeRpcUrl: URL): RpcClient => {
  const log = getLogger("rpc");

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
    node: string,
    blockHash: string,
    length: number
  ): Promise<BlockHeader[]> => {
    const history: BlockHeader[] = [];
    let nextHash = blockHash;
    // very primitive approach: we simply iterate up our chain to find the most recent blocks
    while (history.length < length) {
      const header = await retry404(() => getBlockHeader(node, nextHash));
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

    getEndorsingRights: (block: string, level: number) => {
      return getEndorsingRights(nodeRpcUrl, block, level);
    },

    getBakingRights: (
      block: string,
      level: number,
      max_priority?: number,
      delegate?: string
    ) => {
      return getBakingRights(nodeRpcUrl, block, level, max_priority, delegate);
    },

    getConstants: () => getConstants(nodeRpcUrl),

    getBlockHeader: makeMemoizedAsyncFunction(
      (block: string) => {
        return getBlockHeader(nodeRpcUrl, block);
      },
      (block: string) =>
        block.toLowerCase().startsWith("head") ? null : block,
      10
    ),

    getBlock: (block = "head") => {
      return getBlock(nodeRpcUrl, block);
    },

    getBlockHash: (block = "head") => {
      return getBlockHash(nodeRpcUrl, block);
    },

    getBlockHistory: (blockHash: string, length = 5) => {
      return fetchBlockHeaders(nodeRpcUrl, blockHash, length);
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

    getDelegate: (pkh: TzAddress, block = "head") => {
      return getDelegate(nodeRpcUrl, pkh, block);
    },

    getChainId: () => getChainId(nodeRpcUrl),
  };
};
