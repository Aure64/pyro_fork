import { info } from "loglevel";

export const start = (): NodeJS.Timeout => {
  // dummy timer to keep process alive.  Will replace in future once server is implemented.
  return setInterval(() => {
    info("Polling...");
  }, 1000 * 60 * 60);
};

export const halt = (timeout: NodeJS.Timeout): void => {
  info("Halting server");
  clearInterval(timeout);
};
