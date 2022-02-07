import { delay } from "../delay";
import { getLogger } from "loglevel";
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
        getLogger("rpc").debug(
          `Got ${err.status} from ${err.url}, retrying [${attempts}]`
        );
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
      getLogger("rpc").warn(
        `${label} failed, will retry in ${interval} ms`,
        err
      );
      await delay(interval);
    }
  }
};

class HttpResponseError extends Error {
  status: number;
  statusText: string;
  url: string;
  constructor(
    message: string,
    status: number,
    statusText: string,
    url: string
  ) {
    super(message);
    this.message = message;
    this.status = status;
    this.statusText = statusText;
    this.url = url;
    this.name = "HttpResponseError";
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
  throw new HttpResponseError(
    `HTTP error: (${response.status})`,
    response.status,
    response.statusText,
    url
  );
};
