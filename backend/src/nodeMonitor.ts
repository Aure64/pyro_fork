import { PeerNodeEvent } from "./types";
import { debug } from "loglevel";

type Monitor = { pid: number };

export const start = (onEvent: (event: PeerNodeEvent) => void): Monitor => {
  const monitor: Monitor = { pid: 1 };

  debug(`Node monitor started`);
  onEvent({ type: "PEER", kind: "START", message: "Node monitor started" });

  // start internal monitoring
  // connect onEvent to handle responses

  return monitor;
};

export const halt = (monitor: Monitor): void => {
  debug(`Halting node monitor ${monitor}`);
  // cleanup ongoing processes
};
