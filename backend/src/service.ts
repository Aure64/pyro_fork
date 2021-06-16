import { getLogger } from "loglevel";

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
  const log = getLogger(name);
  let count = 0;
  let shouldRun = true;
  let currentDelay: CancellableDelay | undefined;

  const isInterrupted = () => !shouldRun;

  const start = async () => {
    if (init) {
      log.info(`initializing...`);
      await init();
    }
    log.info(`starting...`);
    try {
      while (shouldRun) {
        count++;
        const t0 = new Date().getTime();
        log.debug(`starting iteration ${count}`);
        await task(isInterrupted);
        const dt = new Date().getTime() - t0;
        log.debug(`iteration ${count} done in ${dt} ms`);
        if (!shouldRun) break;
        currentDelay = delay2(interval);
        await currentDelay.promise;
      }
    } catch (err) {
      if (err instanceof CancelledError) {
        log.info(`stopped`);
      } else {
        log.error(`unexpected error`, err);
      }
    }
  };

  const stop = () => {
    log.info(`stopping...`);
    shouldRun = false;
    currentDelay?.cancel();
  };

  return {
    name,
    start,
    stop,
  };
};
