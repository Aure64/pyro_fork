import { debug, info, error } from "loglevel";

import { delay2, CancellableDelay, CancelledError } from "./delay";

export type Service = {
  name: string;
  start: () => Promise<void>;
  stop: () => void;
};

export const create = (
  name: string,
  task: (isInterrupted: () => boolean) => Promise<void>,
  interval: number = 60 * 1e3,
  init?: () => Promise<void>
): Service => {
  let count = 0;
  let shouldRun = true;
  let currentDelay: CancellableDelay | undefined;

  const isInterrupted = () => shouldRun;

  const start = async () => {
    if (init) {
      info(`[${name}] initializing...`);
      await init();
    }
    info(`[${name}] starting...`);
    try {
      while (shouldRun) {
        count++;
        const t0 = new Date().getTime();
        debug(`[${name}] starting iteration ${count}`);
        await task(isInterrupted);
        const dt = new Date().getTime() - t0;
        debug(`[${name}] iteration ${count} done in ${dt} ms`);
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
