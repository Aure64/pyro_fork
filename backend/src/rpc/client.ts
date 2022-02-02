import { getLogger } from "loglevel";
// import { HttpResponseError } from "@taquito/http-utils";
import { delay } from "../delay";
// import fetch from "cross-fetch";
import LRU from "lru-cache";

import { makeMemoizedAsyncFunction } from "../memoization";

// import { RpcClient as TaquitoRpcClient } from "@taquito/rpc";

// import type { BlockHeaderResponse } from "@taquito/rpc";

import { get as rpcFetch } from "./util";
import { retry404 } from "./util";

import NetworkConnection from "./types/NetworkConnection";
import TezosVersion from "./types/TezosVersion";
import BootstrappedStatus from "./types/BootstrappedStatus";
import EndorsingRightsH from "./types/PtHangz2aRng/EndorsingRights";
import EndorsingRightsI from "./types/Psithaca2MLR/EndorsingRights";
import ConstantsH from "./types/PtHangz2aRng/Constants";
import ConstantsI from "./types/Psithaca2MLR/Constants";
import BakingRightsH from "./types/PtHangz2aRng/BakingRights";
import BakingRightsI from "./types/Psithaca2MLR/BakingRights";
import { Item as BakingRightH } from "./types/PtHangz2aRng/BakingRights";
import { Item as BakingRightI } from "./types/Psithaca2MLR/BakingRights";

import BlockH from "./types/PtHangz2aRng/Block";
import BlockI from "./types/Psithaca2MLR/Block";
import BlockHeaderH from "./types/PtHangz2aRng/BlockHeader";
import BlockHeaderI from "./types/Psithaca2MLR/BlockHeader";

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
import { delegatesUrl } from "./urls";

// interface RPCOptions {
//   block: string;
// }

type TzAddress = string;

type URL = string;

export type BlockHeader = BlockHeaderH | BlockHeaderI;
export type Block = BlockH | BlockI;
export type EndorsingRights = EndorsingRightsH | EndorsingRightsI;

export type BakingRights = BakingRightsH | BakingRightsI;
export type BakingRight = BakingRightH | BakingRightI;
export type Constants = ConstantsH | ConstantsI;

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
): Promise<EndorsingRights> => {
  const params = { level: level.toString() };
  return await rpcFetch(`${node}/${E_ENDORSING_RIGHTS(block, params)}`);
};

const getBakingRights = async (
  node: string,
  block: string,
  level: number,
  max_priority: number
): Promise<BakingRight[]> => {
  const params = {
    level: level.toString(),
    max_priority: max_priority.toString(),
  };
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
): Promise<BlockHeaderH> => {
  return await rpcFetch(`${node}/${E_BLOCK_HEADER(block)}`);
};

export type RpcClient = {
  url: URL;
  getTezosVersion: () => Promise<TezosVersion>;
  getBootsrappedStatus: () => Promise<BootstrappedStatus>;
  getNetworkConnections: () => Promise<NetworkConnection[]>;

  //getBlockHeader: (options?: RPCOptions) => Promise<BlockHeaderResponse>;
  getBlockHeader: (block: string) => Promise<BlockHeader>;

  getBlock: (block: string) => Promise<Block>;

  // getBlockHash: (options?: RPCOptions) => Promise<string>;

  getBlockHash: (block: string) => Promise<string>;

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
  ) => Promise<EndorsingRights>;
  getBakingRights: (
    block: string,
    level: number,
    max_priority: number
  ) => Promise<BakingRight[]>;
  getConstants: () => Promise<Constants>;
  getChainId: () => Promise<string>;
};

export default (nodeRpcUrl: URL): RpcClient => {
  //const rpc = new TaquitoRpcClient(nodeRpcUrl);
  const log = getLogger("rpc");

  // const origGetBlockReader = rpc.getBlockHeader.bind(rpc);
  // rpc.getBlockHeader = makeMemoizedAsyncFunction(
  //   (async (options?: RPCOptions): Promise<BlockHeaderResponse> => {
  //     const b = await origGetBlockReader(options);
  //     return (b.priority === null || b.priority === undefined) &&
  //       "payload_round" in b
  //       ? {
  //           ...b,
  //           priority: (b as unknown as WithPayloadRound).payload_round,
  //         }
  //       : b;
  //   }).bind(rpc),
  //   ({ block }: { block: string }) =>
  //     block.toLowerCase().startsWith("head") ? null : block,
  //   10
  // );

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

  // const fetchBlockHeaders = async (
  //   blockHash: string,
  //   rpc: TaquitoRpcClient,
  //   length: number
  // ): Promise<BlockHeaderResponse[]> => {
  //   const history: BlockHeaderResponse[] = [];
  //   let nextHash = blockHash;
  //   // very primitive approach: we simply iterate up our chain to find the most recent blocks
  //   while (history.length < length) {
  //     const header = await retry404(() =>
  //       rpc.getBlockHeader({ block: nextHash })
  //     );
  //     nextHash = header.predecessor;
  //     history.push(header);
  //   }
  //   return history;
  // };

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

    getBakingRights: (block: string, level: number, max_priority: number) => {
      return getBakingRights(nodeRpcUrl, block, level, max_priority);
    },

    getConstants: () => getConstants(nodeRpcUrl),

    // getBlockHeader: (options?: RPCOptions) => {
    //   return rpc.getBlockHeader(options);
    // },

    getBlockHeader: makeMemoizedAsyncFunction(
      (block: string) => {
        return getBlockHeader(nodeRpcUrl, block);
      },
      (block: string) =>
        block.toLowerCase().startsWith("head") ? null : block,
      10
    ),

    getBlock: (block: string) => {
      return getBlock(nodeRpcUrl, block);
    },

    getBlockHash: (block: string) => {
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

    getChainId: () => getChainId(nodeRpcUrl),
  };
};
