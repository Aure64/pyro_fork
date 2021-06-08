import {
  BakerNodeEvent,
  FutureBakingEvent,
  BakerDeactivationEvent,
  PeerNodeEvent,
  PeerDataEvent,
  TezosNodeEvent,
} from "./types";
import { format, parseISO } from "date-fns";

export default (events: TezosNodeEvent[]) => {
  return events.map(toString).join("\n");
};

const toString = (event: TezosNodeEvent) => {
  switch (event.type) {
    case "BAKER_NODE":
      return bakerNodeEventToString(event);
    case "FUTURE_BAKING":
      return futureBakingEventToString(event);
    case "BAKER_DEACTIVATION":
      return bakerDeactivationEventToString(event);
    case "PEER":
      return peerEventToString(event);
    case "PEER_DATA":
      return peerDataEventToString(event);
    default: {
      // this will only fail to typecheck if some kind isn't handled above
      const n: never = event;
      return n;
    }
  }
};

const bakerNodeEventToString = (event: BakerNodeEvent): string => {
  switch (event.kind) {
    case "MISSED_BAKE":
      return `${event.baker} missed a bake at level ${event.blockLevel}`;
    case "SUCCESSFUL_BAKE":
      return `${event.baker} baked block ${event.blockLevel}`;
    case "DOUBLE_BAKE":
      return `${event.baker} double baked block ${event.blockLevel}`;
    case "MISSED_ENDORSE":
      return `${event.baker} missed endorsement of block ${event.blockLevel}`;
    case "SUCCESSFUL_ENDORSE":
      return `${event.baker} endorsed block ${event.blockLevel}`;
    case "DOUBLE_ENDORSE":
      return `${event.baker} double endorsed block ${event.blockLevel}`;
    default: {
      // this will only fail to typecheck if some kind isn't handled above
      const s: never = event.kind;
      return s;
    }
  }
};

const futureBakingEventToString = (event: FutureBakingEvent): string => {
  switch (event.kind) {
    case "FUTURE_BAKING_OPPORTUNITY":
      return `Delegate ${
        event.baker
      } will have a baking opportunity on ${dateToString(event.date)}`;
    case "FUTURE_ENDORSING_OPPORTUNITY":
      return `Delegate ${
        event.baker
      } will have an endorsement opportunity on ${dateToString(event.date)}`;
    default: {
      // this will only fail to typecheck if some kind isn't handled above
      const s: never = event.kind;
      return s;
    }
  }
};

const bakerDeactivationEventToString = (
  event: BakerDeactivationEvent
): string => {
  switch (event.kind) {
    case "BAKER_DEACTIVATED":
      return `delegate ${event.baker} has been deactivated`;
    case "BAKER_PENDING_DEACTIVATION":
      return `delegate ${event.baker} may be deactivated in cycle ${event.cycle}`;
    default: {
      // this will only fail to typecheck if some kind isn't handled above
      const s: never = event.kind;
      return s;
    }
  }
};

const peerDataEventToString = (event: PeerDataEvent): string => {
  switch (event.kind) {
    case "ERROR":
      return `Unable to reach ${event.node}: ${event.message}`;
    case "RECONNECTED":
      return `Resolved: ${event.node} is reachable again`;
    default: {
      // this will only fail to typecheck if some kind isn't handled above
      const s: never = event.kind;
      return s;
    }
  }
};

const peerEventToString = (event: PeerNodeEvent): string => {
  switch (event.kind) {
    case "NODE_BEHIND":
      return `Node ${event.node} is behind`;
    case "NODE_CAUGHT_UP":
      return `Node ${event.node} has caught up`;
    case "NODE_LOW_PEERS":
      return `Node ${event.node} has a low peer count`;
    case "NODE_ON_A_BRANCH":
      return `Node ${event.node} is on a branch`;
    default: {
      // this will only fail to typecheck if some kind isn't handled above
      const s: never = event.kind;
      return s;
    }
  }
};

const dateToString = (date: Date | string): string => {
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  return format(parsedDate, "MM/dd/yyyy, H:mm:ss");
};
