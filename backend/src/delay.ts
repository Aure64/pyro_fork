import { debug } from "loglevel";

export const delay = (milliseconds: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

export class CancelledError extends Error {}

export type CancellableDelay = {
  cancel: () => void;
  promise: Promise<void>;
};

export const delay2 = (milliseconds: number): CancellableDelay => {
  let cancel = () => {
    debug("dummy delay cancel invoked, no op");
  };
  const promise = new Promise<void>((resolve, reject) => {
    const timeoutHandle = setTimeout(resolve, milliseconds);
    cancel = () => {
      clearTimeout(timeoutHandle);
      reject(new CancelledError());
    };
  });

  return { promise, cancel };
};
