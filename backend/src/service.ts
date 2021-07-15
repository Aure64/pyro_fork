import { getLogger } from "loglevel";

import { delay2, CancellableDelay, CancelledError } from "./delay";

export type Service = {
  name: string;
  start: () => Promise<void>;
  stop: () => void;
};

export type Milliseconds = number;

export const create = (
  name: string,
  task: (isInterrupted: () => boolean) => Promise<void>,
  interval: Milliseconds = 60 * 1e3
): Service => {
  const log = getLogger(name);
  let count = 0;
  let shouldRun = true;
  let currentDelay: CancellableDelay | undefined;

  const isInterrupted = () => !shouldRun;

  const start = async () => {
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
