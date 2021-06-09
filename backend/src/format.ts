import {
  BakerNodeEvent,
  BakerNodeEventKind,
  FutureBakingEvent,
  FutureBakingEventKind,
  BakerDeactivationEvent,
  BakerDeactivationEventKind,
  PeerNodeEvent,
  PeerNodeEventKind,
  PeerDataEvent,
  DataEventKind,
  TezosNodeEvent,
} from "./types";
import { format, parseISO } from "date-fns";

export default (events: TezosNodeEvent[]): string => {
  return events.map(toString).join("\n");
};

const BakerNodeEventFormatters: {
  [K in BakerNodeEventKind]: (event: BakerNodeEvent) => string;
} = {
  MISSED_BAKE: (e) => `${e.baker} missed a bake at level ${e.blockLevel}`,
  SUCCESSFUL_BAKE: (e) => `${e.baker} baked block ${e.blockLevel}`,
  DOUBLE_BAKE: (e) => `${e.baker} double baked block ${e.blockLevel}`,
  MISSED_ENDORSE: (e) =>
    `${e.baker} missed endorsement of block ${e.blockLevel}`,
  SUCCESSFUL_ENDORSE: (e) => `${e.baker} endorsed block ${e.blockLevel}`,
  DOUBLE_ENDORSE: (e) => `${e.baker} double endorsed block ${e.blockLevel}`,
};

const bakerNodeEventToString = (e: BakerNodeEvent): string =>
  BakerNodeEventFormatters[e.kind](e);

const FutureBakingEventFormatters: {
  [K in FutureBakingEventKind]: (event: FutureBakingEvent) => string;
} = {
  FUTURE_BAKING_OPPORTUNITY: (e) =>
    `Delegate ${e.baker} will have a baking opportunity on ${dateToString(
      e.date
    )}`,
  FUTURE_ENDORSING_OPPORTUNITY: (e) =>
    `Delegate ${e.baker} will have an endorsement opportunity on ${dateToString(
      e.date
    )}`,
};
const futureBakingEventToString = (e: FutureBakingEvent): string =>
  FutureBakingEventFormatters[e.kind](e);

const BakerDeactivationEventFormatters: {
  [K in BakerDeactivationEventKind]: (e: BakerDeactivationEvent) => string;
} = {
  BAKER_DEACTIVATED: (e) => `delegate ${e.baker} has been deactivated`,
  BAKER_PENDING_DEACTIVATION: (e) =>
    `delegate ${e.baker} may be deactivated in cycle ${e.cycle}`,
};
const bakerDeactivationEventToString = (e: BakerDeactivationEvent): string =>
  BakerDeactivationEventFormatters[e.kind](e);

const PeerDataEventFormatters: {
  [K in DataEventKind]: (e: PeerDataEvent) => string;
} = {
  ERROR: (e) => `Unable to reach ${e.node}: ${e.message}`,
  RECONNECTED: (e) => `Resolved: ${e.node} is reachable again`,
};

const peerDataEventToString = (e: PeerDataEvent): string =>
  PeerDataEventFormatters[e.kind](e);

const PeerNodeEventFormatters: {
  [K in PeerNodeEventKind]: (e: PeerNodeEvent) => string;
} = {
  NODE_BEHIND: (e) => `Node ${e.node} is behind`,
  NODE_CAUGHT_UP: (e) => `Node ${e.node} has caught up`,
  NODE_LOW_PEERS: (e) => `Node ${e.node} has a low peer count`,
  NODE_ON_A_BRANCH: (e) => `Node ${e.node} is on a branch`,
};

const peerEventToString = (e: PeerNodeEvent): string =>
  PeerNodeEventFormatters[e.kind](e);

const dateToString = (date: Date | string): string => {
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  return format(parsedDate, "MM/dd/yyyy, H:mm:ss");
};

//See https://stackoverflow.com/questions/46641380/exhaustive-map-over-a-union-of-typed-objects
const TezosNodeEventFormatters: {
  [K in TezosNodeEvent["type"]]: (
    u: Extract<TezosNodeEvent, { type: K }>
  ) => string;
} = {
  BAKER_NODE: bakerNodeEventToString,
  FUTURE_BAKING: futureBakingEventToString,
  BAKER_DEACTIVATION: bakerDeactivationEventToString,
  PEER: peerEventToString,
  PEER_DATA: peerDataEventToString,
};

const toString = (e: TezosNodeEvent) =>
  (TezosNodeEventFormatters[e.type] as (v: TezosNodeEvent) => string)(e);
