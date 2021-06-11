import { info, error } from "loglevel";

import { delay2, CancellableDelay, CancelledError } from "./delay";

export type Service = {
  name: string;
  start: () => Promise<void>;
  stop: () => void;
};

export const create = (
  name: string,
  task: () => Promise<void>,
  interval: number = 60 * 1e3,
  init?: () => Promise<void>
): Service => {
  let shouldRun = true;
  let currentDelay: CancellableDelay | undefined;

  const start = async () => {
    if (init) {
      await init();
    }

    try {
      while (shouldRun) {
        await task();
        if (!shouldRun) break;
        currentDelay = delay2(interval);
        await currentDelay.promise;
      }
    } catch (err) {
      if (err instanceof CancelledError) {
        info(`[${name}] cancelled`);
      } else {
        error(`[${name}] unexpected error`, err);
      }
    }
  };

  const stop = () => {
    info(`[${name}] stopping...`);
    shouldRun = false;
    currentDelay?.cancel();
  };

  return {
    name,
    start,
    stop,
  };
};
