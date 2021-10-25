import { debug, warn } from "loglevel";
import { HttpResponseError } from "@taquito/http-utils";
import { delay } from "./delay";
import fetch from "cross-fetch";
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
