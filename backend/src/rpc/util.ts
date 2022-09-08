import { delay } from "../delay";
import { getLogger } from "loglevel";
import fetch from "cross-fetch";
import { TzAddress } from "./types";
/**
 * Wraps provided API function so that it is retried on 404.
 * These are common on server clusters where a node may slightly lag
 * behind another and not know about a block or delegate yet.
 */

type Millisecond = number;

type RpcRetry = <T>(
  apiCall: () => Promise<T>,
  interval: Millisecond,
  maxAttempts: number
) => Promise<T>;

export const retry404: RpcRetry = async (apiCall, interval, maxAttempts) => {
  let attempts = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    attempts++;
    try {
      return await apiCall();
    } catch (err) {
      if (attempts > maxAttempts) {
        throw err;
      }
      if (err instanceof HttpResponseError && err.status === 404) {
        getLogger("rpc").warn(
          `Got ${err.status} from ${err.url}, retrying in ${interval}ms [attempt ${attempts} of ${maxAttempts}]`
        );
        await delay(interval);
      } else {
        throw err;
      }
    }
  }
};

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
      getLogger("rpc").warn(
        `${label} failed, will retry in ${interval} ms`,
        err
      );
      await delay(interval);
    }
  }
};

export type TezosNodeError = {
  id: string;
  kind: string;
  pkh?: TzAddress;
};

export class HttpResponseError extends Error {
  status: number;
  statusText: string;
  url: string;
  nodeErrors: TezosNodeError[];
  constructor(
    message: string,
    status: number,
    statusText: string,
    url: string,
    nodeErrors: TezosNodeError[]
  ) {
    super(message);
    this.message = message;
    this.status = status;
    this.statusText = statusText;
    this.url = url;
    this.name = "HttpResponseError";
    this.nodeErrors = nodeErrors;
  }
}

// https://stackoverflow.com/questions/46946380/fetch-api-request-timeout/57888548#57888548

export const fetchTimeout = (url: string, ms: number) => {
  const controller = new AbortController();
  const promise = fetch(url, { signal: controller.signal });
  const timeout = setTimeout(() => controller.abort(), ms);
  return promise.finally(() => clearTimeout(timeout));
};

export const get = async (url: string) => {
  const t0 = new Date().getTime();
  const response = await fetchTimeout(url, 30e3);
  const dt = new Date().getTime() - t0;
  getLogger("rpc").debug(`|> ${url} in ${dt} ms`);
  if (response.ok) {
    return response.json();
  }
  let nodeErrors: TezosNodeError[] = [];
  if (response.status === 500) {
    try {
      nodeErrors = (await response.json()) || [];
    } catch (err) {
      getLogger("rpc").error(
        `|> 500 ${url} could not get error response content`
      );
    }
  }
  throw new HttpResponseError(
    `${response.status} ${url}`,
    response.status,
    response.statusText,
    url,
    nodeErrors
  );
};
