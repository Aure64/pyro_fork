import { debug, warn } from "loglevel";
import { HttpResponseError } from "@taquito/http-utils";
import { delay } from "./delay";
import fetch from "cross-fetch";

import { makeMemoizedAsyncFunction } from "./memoization";

import { RpcClient as TaquitoRpcClient } from "@taquito/rpc";

import type { BlockHeaderResponse } from "@taquito/rpc";

interface RPCOptions {
  block: string;
}

/**
 * Wraps provided API function so that it is retried on 404.
 * These are common on server clusters where a node may slightly lag
 * behind another and not know about a block or delegate yet.
 */

type RpcRetry = <T>(apiCall: () => Promise<T>) => Promise<T>;

export const retry404: RpcRetry = async (apiCall) => {
  let attempts = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    attempts++;
    try {
      return await apiCall();
    } catch (err) {
      if (attempts > 2) {
        throw err;
      }
      if (err instanceof HttpResponseError && err.status === 404) {
        debug(`Got ${err.status} from ${err.url}, retrying [${attempts}]`);
        await delay(1000);
      } else {
        throw err;
      }
    }
  }
};

type Millisecond = number;

type URL = string;

type TzAddress = string;

type TryForever = <T>(
  call: () => Promise<T>,
  interval: Millisecond,
  label: string
) => Promise<T>;

export const tryForever: TryForever = async (call, interval, label = "") => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await call();
    } catch (err) {
      warn(`${label} failed, will retry in ${interval} ms`, err);
      await delay(interval);
    }
  }
};

export const rpcFetch = async (url: string) => {
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

export type TezosVersion = {
  version: {
    major: number;
    minor: number;
    additional_info: undefined | "release" | "dev" | { rc: number };
  };
  network_version: { chain_name: string };
  commit_info: { commit_hash: string; commit_date: string };
};

export const getNetworkConnections = async (
  node: string
): Promise<NetworkConnection[]> => {
  return await rpcFetch(`${node}/network/connections`);
};

export const getTezosVersion = async (node: string): Promise<TezosVersion> => {
  return await rpcFetch(`${node}/version`);
};

export type BootstrappedStatus = {
  bootstrapped: boolean;
  sync_state: "synced" | "unsynced" | "stuck";
};

export const getBootstrappedStatus = async (
  node: string
): Promise<BootstrappedStatus> => {
  return await rpcFetch(`${node}/chains/main/is_bootstrapped`);
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

const delegatesUrl = (rpcUrl: string, pkh: TzAddress, block: string) => {
  return `${rpcUrl}/chains/main/blocks/${block}/context/delegates/${pkh}`;
};

export const client = (nodeRpcUrl: URL): RpcClient => {
  const rpc = new TaquitoRpcClient(nodeRpcUrl);

  rpc.getBlockHeader = makeMemoizedAsyncFunction(
    rpc.getBlockHeader.bind(rpc),
    ({ block }: { block: string }) =>
      block.toLowerCase().startsWith("head") ? null : block,
    10
  );

  return {
    url: nodeRpcUrl,
    getTezosVersion: () => getTezosVersion(nodeRpcUrl),
    getBootsrappedStatus: () => getBootstrappedStatus(nodeRpcUrl),
    getNetworkConnections: () => getNetworkConnections(nodeRpcUrl),

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
      return rpcFetch(`${delegatesUrl(nodeRpcUrl, pkh, block)}/balance`);
    },

    getFrozenBalance: (pkh: TzAddress, block = "head") => {
      return rpcFetch(`${delegatesUrl(nodeRpcUrl, pkh, block)}/frozen_balance`);
    },

    getStakingBalance: (pkh: TzAddress, block = "head") => {
      return rpcFetch(
        `${delegatesUrl(nodeRpcUrl, pkh, block)}/staking_balance`
      );
    },

    getGracePeriod: (pkh: TzAddress, block = "head") => {
      return rpcFetch(`${delegatesUrl(nodeRpcUrl, pkh, block)}/grace_period`);
    },

    getDeactivated: (pkh: TzAddress, block = "head") => {
      return rpcFetch(`${delegatesUrl(nodeRpcUrl, pkh, block)}/deactivated`);
    },
  };
};
