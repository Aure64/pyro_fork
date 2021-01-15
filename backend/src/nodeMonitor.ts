import { PeerNodeEvent } from "./types";

type Monitor = { pid: number };

export const start = (onEvent: (event: PeerNodeEvent) => void): Monitor => {
  const monitor: Monitor = { pid: 1 };

  console.log(`Node monitor started`);
  onEvent({ type: "PEER", kind: "START", message: "Node monitor started" });

  // start internal monitoring
  // connect onEvent to handle responses

  return monitor;
};

export const halt = (monitor: Monitor): void => {
  console.log(`Halting node monitor ${monitor}`);
  // cleanup ongoing processes
};
