import * as eventTypes from "./types2";
import { Kind as E } from "./types2";
import { format, parseISO } from "date-fns";

export default (events: eventTypes.Event[]): string => {
  return events.map(toString).join("\n");
};

const dateToString = (date: Date | string): string => {
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  return format(parsedDate, "MM/dd/yyyy, H:mm:ss");
};

const Formatters: {
  [K in eventTypes.Event["kind"]]: (
    u: Extract<eventTypes.Event, { kind: K }>
  ) => string;
} = {
  [E.MissedBake]: (e) => `${e.baker} missed a bake at level ${e.level}`,
  [E.Baked]: (e) => `${e.baker} baked block ${e.level}`,
  [E.DoubleBaked]: (e) => `${e.baker} double baked block ${e.level}`,
  [E.MissedEndorsement]: (e) =>
    `${e.baker} missed endorsement of block ${e.level}`,
  [E.Endorsed]: (e) => `${e.baker} endorsed block ${e.level}`,
  [E.DoubleEndorsed]: (e) => `${e.baker} double endorsed block ${e.level}`,
  [E.BakeScheduled]: (e) =>
    `${e.baker} will have a baking opportunity on ${dateToString(
      e.estimatedTime
    )}`,
  [E.EndorsementScheduled]: (e) =>
    `${e.baker} will have an endorsement opportunity on ${dateToString(
      e.estimatedTime
    )}`,
  [E.NodeBehind]: (e) => `Node ${e.node} is behind`,
  [E.NodeSynced]: (e) => `Node ${e.node} has caught up`,
  [E.NodeLowPeers]: (e) => `Node ${e.node} has a low peer count`,
  [E.NodeOnBranch]: (e) => `Node ${e.node} is on a branch`,
  [E.Deactivated]: (e) => `${e.baker} has been deactivated`,
  [E.DeactivationRisk]: (e) =>
    `${e.baker} is at risk of deactivation in cycle ${e.cycle}`,
  [E.RpcError]: (e) => `Unable to reach ${e.node}: ${e.message}`,
  [E.RpcErrorResolved]: (e) => `Resolved: ${e.node} is reachable again`,
  [E.Notification]: (e) => `${e.message}`,
};

export const toString = (e: eventTypes.Event) =>
  (Formatters[e.kind] as (v: eventTypes.Event) => string)(e);
