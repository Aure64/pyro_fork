import * as events from "./types2";
import { format, parseISO } from "date-fns";

export default (events: events.Event[]): string => {
  return events.map(toString).join("\n");
};

const dateToString = (date: Date | string): string => {
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  return format(parsedDate, "MM/dd/yyyy, H:mm:ss");
};

const Formatters: {
  [K in events.Event["kind"]]: (
    u: Extract<events.Event, { kind: K }>
  ) => string;
} = {
  missed_bake: (e) => `${e.baker} missed a bake at level ${e.level}`,
  baked: (e) => `${e.baker} baked block ${e.level}`,
  double_baked: (e) => `${e.baker} double baked block ${e.level}`,
  missed_endorsement: (e) =>
    `${e.baker} missed endorsement of block ${e.level}`,
  endorsed: (e) => `${e.baker} endorsed block ${e.level}`,
  double_endorsed: (e) => `${e.baker} double endorsed block ${e.level}`,
  bake_scheduled: (e) =>
    `${e.baker} will have a baking opportunity on ${dateToString(
      e.estimatedTime
    )}`,
  endorsement_scheduled: (e) =>
    `${e.baker} will have an endorsement opportunity on ${dateToString(
      e.estimatedTime
    )}`,
  node_behind: (e) => `Node ${e.node} is behind`,
  node_synced: (e) => `Node ${e.node} has caught up`,
  node_low_peers: (e) => `Node ${e.node} has a low peer count`,
  node_on_branch: (e) => `Node ${e.node} is on a branch`,
  deactivated: (e) => `${e.baker} has been deactivated`,
  deactivation_risk: (e) =>
    `${e.baker} is at risk of deactivation in cycle ${e.cycle}`,
  rpc_error: (e) => `Unable to reach ${e.node}: ${e.message}`,
  rpc_error_resolved: (e) => `Resolved: ${e.node} is reachable again`,
  notification: (e) => `${e.message}`,
};

export const toString = (e: events.Event) =>
  (Formatters[e.kind] as (v: events.Event) => string)(e);
