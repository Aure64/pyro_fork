import { TezosNodeEvent } from "./types";
import { debug } from "loglevel";

export const notify = (event: TezosNodeEvent): void => {
  switch (event.type) {
    case "BAKER":
      debug(`Baker event received: ${event.kind}\n${event.message}`);
      break;
    case "PEER":
      debug(`Peer event received: ${event.kind}\n${event.message}`);
      break;
    case "RPC":
      debug(`RPC event received: ${event.kind}\n${event.message}`);
      break;
  }
};
