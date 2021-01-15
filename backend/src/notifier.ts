import { TezosNodeEvent } from "./types";

export const notify = (event: TezosNodeEvent): void => {
  switch (event.type) {
    case "BAKER":
      console.log(`Baker event received: ${event.kind}\n${event.message}`);
      break;
    case "PEER":
      console.log(`Peer event received: ${event.kind}\n${event.message}`);
      break;
    case "RPC":
      console.log(`RPC event received: ${event.kind}\n${event.message}`);
      break;
  }
};
