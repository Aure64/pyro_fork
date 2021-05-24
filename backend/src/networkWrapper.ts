import { ApiResult } from "./types";
import to from "await-to-js";
import { debug } from "loglevel";

import { HttpResponseError } from "@taquito/http-utils";

type Wrap = <T>(apiCall: () => Promise<T>) => Promise<ApiResult<T>>;

/**
 * Wrap will call the provided API function and tweak it's behavior:
 * - retry a 404 failure. These are common on server clusters where a node may slightly lag
 *   behind another and not know about a block or delegate yet.
 * - wrap the response in a ApiResult<T> type. This guarantees either success with data, or
 *   an error.
 */
export const wrap: Wrap = async (apiCall) => {
  let [error, data] = await to(apiCall());

  // retry once after one second
  if (error && "status" in error && error["status"] === 404) {
    debug(`API call failed.  Retrying in one second...`);
    await wait(1000);
    [error, data] = await to(apiCall());
  }

  if (data) {
    return { type: "SUCCESS", data };
  } else if (error) {
    return { type: "ERROR", error };
  } else {
    const message = `API call failed by returning no data`;
    const error = new Error(message);
    return { type: "ERROR", error };
  }
};

type Wrap2 = <T>(apiCall: () => Promise<T>) => Promise<T>;

export const wrap2: Wrap2 = async (apiCall) => {
  let attempts = 0;
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
        await wait(1000);
      } else {
        throw err;
      }
    }
  }
};

const wait = async (milliseconds: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
};
