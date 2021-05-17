import {
  BakerDataEvent,
  BakerNodeEvent,
  FutureBakingEvent,
  BakerDeactivationEvent,
  NotifyFunction,
  NotifyEventFunction,
  NotifierEvent,
  PeerNodeEvent,
  PeerDataEvent,
  TezosNodeEvent,
} from "../types";
import { format, parseISO } from "date-fns";

/**
 * Convert a notify channel from one that takes message and title strings to one that takes an event. This
 * consts middleware work with compconste events while notification channels work with strings.
 */
export const apply = (notifyFunction: NotifyFunction): NotifyEventFunction => {
  return async (event: TezosNodeEvent | NotifierEvent) => {
    let message;
    switch (event.type) {
      case "BAKER_NODE":
        message = bakerNodeEventToString(event);
        break;
      case "BAKER_DATA":
        message = bakerDataEventToString(event);
        break;
      case "FUTURE_BAKING":
        message = futureBakingEventToString(event);
        break;
      case "BAKER_DEACTIVATION":
        message = bakerDeactivationEventToString(event);
        break;
      case "NOTIFIER":
        message = notifierEventToString(event);
        break;
      case "PEER":
        message = peerEventToString(event);
        break;
      case "PEER_DATA":
        message = peerDataEventToString(event);
        break;
      default: {
        // this will only fail to typecheck if some kind isn't handled above
        const n: never = event;
        return n;
      }
    }
    const details = "";
    return notifyFunction({ title: message, message: details });
  };
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

const bakerDataEventToString = (event: BakerDataEvent): string => {
  switch (event.kind) {
    case "ERROR":
      return `Baker monitor encountered error: ${event.message}`;
    case "RECONNECTED":
      return `Baker monitor has reconnected`;
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

const notifierEventToString = (event: NotifierEvent): string => {
  return event.message;
};

const peerDataEventToString = (event: PeerDataEvent): string => {
  switch (event.kind) {
    case "ERROR":
      return `Node monitor encountered error: ${event.message}`;
    case "RECONNECTED":
      return `Node monitor has reconnected`;
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
