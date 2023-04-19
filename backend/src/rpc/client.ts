import { getLogger } from "loglevel";
import { delay } from "../delay";
import { LRUCache } from "lru-cache";

import { makeMemoizedAsyncFunction } from "../memoization";

import { get as rpcFetch } from "./util";
import { retry404 as _retry404 } from "./util";
import { HttpResponseError } from "./util";

import { NetworkConnection } from "./types";
import { TezosVersion } from "./types";
import { BootstrappedStatus } from "./types";
import { BlockHeader } from "./types";
import { Delegate } from "./types";
import { Participation } from "./types";

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
import { E_DELEGATE_PARTICIPATION } from "./urls";
import { delegatesUrl } from "./urls";

import { TzAddress } from "rpc/types";
import { URL } from "rpc/types";
import { ConsensusKey } from "rpc/types";

import { Block } from "./types";
import { BakingRights } from "./types";
import { EndorsingRights } from "./types";
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

const F_FROZEN_DEPOSITS = "frozen_deposits";
const F_FROZEN_BALANCE = "frozen_balance";

const F_BALANCE = "balance";
const F_FULL_BALANCE = "full_balance";

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
  getFullBalance: (pkh: TzAddress, block?: string) => Promise<string>;
  getFrozenDeposits: (pkh: TzAddress, block?: string) => Promise<string>;
  getStakingBalance: (pkh: TzAddress, block?: string) => Promise<string>;
  getGracePeriod: (pkh: TzAddress, block?: string) => Promise<number>;
  getConsensusKey: (
    pkh: TzAddress,
    block?: string
  ) => Promise<ConsensusKey | null>;
  getDeactivated: (pkh: TzAddress, block?: string) => Promise<boolean>;
  getEndorsingRights: (
    block: string,
    level: number
  ) => Promise<EndorsingRights>;
  getBakingRights: (
    block: string,
    level: number,
    max_priority?: number,
    delegate?: string
  ) => Promise<BakingRights>;
  getConstants: () => Promise<Constants>;
  getChainId: () => Promise<string>;
  getDelegate: (pkh: TzAddress, block?: string) => Promise<Delegate>;
  getParticipation: (pkh: TzAddress, block?: string) => Promise<Participation>;
  getRights: (
    level: number,
    maxRoundOrPriority: number
  ) => Promise<[BakingRights, EndorsingRights]>;
};

export type RpcClientConfig = {
  retry_interval_ms: number;
  retry_attempts: number;
};

export default (
  nodeRpcUrl: URL,
  {
    retry_interval_ms: retryIntervalMs,
    retry_attempts: retryAttempts,
  }: RpcClientConfig
): RpcClient => {
  const retry404 = <T>(apiCall: () => Promise<T>) => {
    return _retry404(apiCall, retryIntervalMs, retryAttempts);
  };

  const getEndorsingRights = async (
    node: string,
    block: string,
    level: number
  ): Promise<EndorsingRights> => {
    const params = { level: level.toString() };
    return retry404(() =>
      rpcFetch(`${node}/${E_ENDORSING_RIGHTS(block, params)}`)
    );
  };

  const getBakingRights = async (
    node: string,
    block: string,
    level: number,
    max_priority?: number,
    delegate?: string
  ): Promise<BakingRights> => {
    const params: Record<string, string> = { level: level.toString() };
    if (level !== undefined) {
      params.level = level.toString();
    }
    if (max_priority !== undefined) {
      params.max_priority = max_priority.toString();
      params.max_round = params.max_priority; //renamed in Ithaca
    }
    if (delegate !== undefined) {
      params.delegate = delegate;
    }
    return retry404(() =>
      rpcFetch(`${node}/${E_BAKING_RIGHTS(block, params)}`)
    );
  };

  const getConstants = async (node: string): Promise<Constants> => {
    return await rpcFetch(`${node}/${E_CONSTANTS("head")}`);
  };

  const getChainId = async (node: string): Promise<string> => {
    return await rpcFetch(`${node}/${E_CHAIN_ID}`);
  };

  const getBlock = async (node: string, block: string): Promise<Block> => {
    return retry404(() => rpcFetch(`${node}/${E_BLOCK(block)}`));
  };

  const getBlockHash = async (node: string, block: string): Promise<string> => {
    return retry404(() => rpcFetch(`${node}/${E_BLOCK_HASH(block)}`));
  };

  const _getBlockHeader = async (
    node: string,
    block: string
  ): Promise<BlockHeader> => {
    return retry404(() => rpcFetch(`${node}/${E_BLOCK_HEADER(block)}`));
  };

  const getBlockHeader = makeMemoizedAsyncFunction(
    (nodeRpcUrl: string, block: string) => {
      return _getBlockHeader(nodeRpcUrl, block);
    },
    (_nodeRpcUrl: string, block: string) =>
      block.toLowerCase().startsWith("head") ? null : block,
    10
  );

  const getDelegate = async (
    node: string,
    pkh: string,
    block: string
  ): Promise<Delegate> => {
    return await rpcFetch(`${node}/${E_DELEGATES_PKH(block, pkh)}`);
  };

  const getParticipation = async (
    node: string,
    pkh: string,
    block: string
  ): Promise<Participation> => {
    return await rpcFetch(`${node}/${E_DELEGATE_PARTICIPATION(block, pkh)}`);
  };

  const log = getLogger("rpc");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const delegateCache = new LRUCache<string, any>({
    max: 5 * 25,
    ttl: 60e3,
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
      delegateCache.set(cacheKey, value, {
        ttl: 60e3 * (1 + 3 * Math.random()),
      });
    } else {
      log.debug(
        `CACHE HIT: '${value}' under ${cacheKey} (${delegateCache.size} items cached)`
      );
    }
    return value;
  };

  const tezosVersionCache = new LRUCache<string, TezosVersion>({
    max: 1,
    ttl: 5 * 60e3,
  });

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
      const header = await getBlockHeader(node, nextHash);
      nextHash = header.predecessor;
      history.push(header);
    }
    return history;
  };

  //try Ithaca endpoint first
  let frozenDepositsFields = [F_FROZEN_DEPOSITS, F_FROZEN_BALANCE];
  let fullBalanceFields = [F_FULL_BALANCE, F_BALANCE];

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

    //.../balance renamed .../full_balance in Ithaca
    getFullBalance: async (pkh: TzAddress, block = "head") => {
      try {
        return await fetchDelegateField(pkh, block, fullBalanceFields[0]);
      } catch (err) {
        if (err instanceof HttpResponseError && err.status === 404) {
          log.info(
            `Got 404 for ${fullBalanceFields[0]}, switching to ${fullBalanceFields[1]}`
          );
          const result = await fetchDelegateField(
            pkh,
            block,
            fullBalanceFields[1]
          );
          fullBalanceFields = [...fullBalanceFields].reverse();
          return result;
        }
      }
    },

    //.../frozen_balance renamed .../frozen_deposits in Ithaca
    getFrozenDeposits: async (pkh: TzAddress, block = "head") => {
      try {
        return await fetchDelegateField(pkh, block, frozenDepositsFields[0]);
      } catch (err) {
        if (err instanceof HttpResponseError && err.status === 404) {
          log.info(
            `Got 404 for ${frozenDepositsFields[0]}, switching to ${frozenDepositsFields[1]}`
          );
          const result = await fetchDelegateField(
            pkh,
            block,
            frozenDepositsFields[1]
          );
          frozenDepositsFields = [...frozenDepositsFields].reverse();
          return result;
        }
      }
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

    getParticipation: (pkh: TzAddress, block = "head") => {
      return getParticipation(nodeRpcUrl, pkh, block);
    },

    getConsensusKey: async (pkh: TzAddress, block = "head") => {
      try {
        return await fetchDelegateField(pkh, block, "consensus_key");
      } catch (err) {
        if (err instanceof HttpResponseError && err.status === 404) {
          log.debug(`Got ${err.status} from ${err.url}`);
        }
        return Promise.resolve(null);
      }
    },

    getChainId: () => getChainId(nodeRpcUrl),

    getRights: async (
      level: number,
      maxRoundOrPriority: number
    ): Promise<[BakingRights, EndorsingRights]> => {
      const blockId = `${level}`;
      const bakingRightsPromise = getBakingRights(
        nodeRpcUrl,
        blockId,
        level,
        maxRoundOrPriority
      );
      const endorsingRightsPromise = getEndorsingRights(
        nodeRpcUrl,
        blockId,
        level - 1
      );
      const [bakingRights, endorsingRights] = await Promise.all([
        bakingRightsPromise,
        endorsingRightsPromise,
      ]);

      return [bakingRights, endorsingRights];
    },
  };
};
