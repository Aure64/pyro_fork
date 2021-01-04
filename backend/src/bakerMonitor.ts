import { BakerNodeEvent } from "./types";

type Monitor = { pid: number };

export const start = (onEvent: (event: BakerNodeEvent) => void): Monitor => {
  const monitor: Monitor = { pid: 1 };

  console.log(`Baker monitor started`);
  // logging onEvent for now to silence unused warning
  console.log(onEvent);

  // start internal monitoring
  // connect onEvent to handle responses

  return monitor;
};

export const halt = (monitor: Monitor): void => {
  console.log(`Halting baker monitor ${monitor}`);
  // cleanup ongoing processes
};

export default { start, halt };
