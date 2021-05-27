import { debug } from "loglevel";

import { HttpResponseError } from "@taquito/http-utils";

/**
 * Wraps provided API function so that it is retried on 404.
 * These are common on server clusters where a node may slightly lag
 * behind another and not know about a block or delegate yet.
 */

type Wrap2 = <T>(apiCall: () => Promise<T>) => Promise<T>;

export const wrap2: Wrap2 = async (apiCall) => {
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
