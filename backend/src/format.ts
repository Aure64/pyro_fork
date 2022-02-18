import * as eventTypes from "./events";
import { Events as E } from "./events";
import { groupBy, sortBy, countBy, first, last } from "lodash";

const isBakerEvent = (e: eventTypes.Event): e is eventTypes.BakerEvent =>
  "baker" in e;

const isBlockEvent = (e: any): e is eventTypes.BlockEvent => "level" in e;

const nonBakerEvent = (e: eventTypes.Event) => !isBakerEvent(e);

const format = (
  events: eventTypes.Event[],
  useEmoji = false,
  abbreviateAddress = false
): string[] => {
  const bakerEvents = events.filter(isBakerEvent);
  const otherEvents = events.filter(nonBakerEvent);
  const formattedBakerEvents = aggregateByBaker(
    bakerEvents,
    useEmoji,
    abbreviateAddress
  );
  const formattedOtherEvents = otherEvents.map(toString);
  return [...formattedOtherEvents, ...formattedBakerEvents];
};

export default format;

const KindEmojiFormatters: {
  [K in eventTypes.Event["kind"]]: string;
} = {
  [E.MissedBake]: "😡",
  [E.MissedBonus]: "😾",
  [E.Baked]: "🥖",
  [E.DoubleBaked]: "✂️️️️",
  [E.MissedEndorsement]: "😕",
  [E.Endorsed]: "👍",
  [E.DoubleEndorsed]: "‼️️",
  [E.DoublePreendorsed]: "‼️️",
  [E.NodeBehind]: "🐌",
  [E.NodeSynced]: "💫",
  [E.NodeLowPeers]: "🤔",
  [E.NodeOnBranch]: "🍂",
  [E.Deactivated]: "😴",
  [E.DeactivationRisk]: "😪",
  [E.RpcError]: "⚠️",
  [E.RpcErrorResolved]: "✨",
  [E.Notification]: "🔔",
};

const formatKindEmoji = (kind: E) => KindEmojiFormatters[kind];

const formatKindText = (kind: E): string => kind.replace("_", " ");

const Formatters: {
  [K in eventTypes.Event["kind"]]: (
    u: Extract<eventTypes.Event, { kind: K }>
  ) => string;
} = {
  [E.MissedBake]: (e) => `${e.baker} missed a bake at level ${e.level}`,
  [E.MissedBonus]: (e) => `${e.baker} missed a bonus at level ${e.level}`,
  [E.Baked]: (e) => `${e.baker} baked block ${e.level}`,
  [E.DoubleBaked]: (e) => `${e.baker} double baked block ${e.level}`,
  [E.MissedEndorsement]: (e) =>
    `${e.baker} missed endorsement of block ${e.level}`,
  [E.Endorsed]: (e) => `${e.baker} endorsed block ${e.level}`,
  [E.DoubleEndorsed]: (e) => `${e.baker} double endorsed block ${e.level}`,
  [E.DoublePreendorsed]: (e) =>
    `${e.baker} double preendorsed block ${e.level}`,
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

export const abbreviateBakerAddress = (addr: string) =>
  `${addr.substr(0, 4)}..${addr.substr(-4)}`;

export const toString = (e: eventTypes.Event): string =>
  (Formatters[e.kind] as (v: eventTypes.Event) => string)(e);

export const formatRange = (a?: number, b?: number): string => {
  if (!a && !b) return "";
  if (a && (!b || b === a)) return `${a}`;
  if (b && !a) return `${b}`;
  return `${a}-${b}`;
};

export const levelRange = (events: eventTypes.Event[]): [number?, number?] => {
  const sorted = sortBy(events.filter(isBlockEvent), "level");
  const firstEvent = first(sorted);
  const lastEvent = last(sorted);
  const firstLevel =
    firstEvent && ("level" in firstEvent ? firstEvent.level : undefined);
  const lastLevel =
    lastEvent && ("level" in lastEvent ? lastEvent.level : undefined);
  return [firstLevel, lastLevel];
};

export const aggregateByBaker = (
  events: eventTypes.BakerEvent[],
  useEmoji = false,
  abbreviateAddress = false
): string[] => {
  const formatKind = useEmoji ? formatKindEmoji : formatKindText;
  const eventsByBaker = groupBy(events, "baker");
  const lines: string[] = [];
  for (const baker in eventsByBaker) {
    const bakerEvents = eventsByBaker[baker];
    const eventsByKind = groupBy(bakerEvents, "kind");
    const formattedWithCounts: string[] = [];
    for (const kind in eventsByKind) {
      let formattedRange = "";
      const events = eventsByKind[kind];
      if (kind === E.Deactivated || kind === E.DeactivationRisk) {
        const firstEvent = first(events) as eventTypes.CycleEvent;
        formattedRange = `cycle ${firstEvent.cycle}`;
      } else {
        const [firstLevel, lastLevel] = levelRange(events);
        formattedRange = formatRange(firstLevel, lastLevel);
      }
      const count = events.length;
      const formattedKind = `${formatKind(kind as E)}${
        count === 1 ? "" : " " + count
      } @ ${formattedRange}`;
      formattedWithCounts.push(formattedKind);
    }
    const formattedBaker = abbreviateAddress
      ? abbreviateBakerAddress(baker)
      : baker;
    const line = `${formattedBaker} ${formattedWithCounts.join(", ")}`;
    lines.push(line);
  }
  return lines;
};

export const summary = (
  events: eventTypes.Event[],
  useEmoji = false
): string => {
  const formatKind = useEmoji ? formatKindEmoji : formatKindText;
  const counts = countBy(events, "kind");

  const [firstLevel, lastLevel] = levelRange(events);
  const formattedRange = formatRange(firstLevel, lastLevel);

  const allEventNames = Object.values(eventTypes.Events);
  const parts: string[] = [];

  for (const kind of allEventNames) {
    if (counts[kind]) {
      parts.push(`${formatKind(kind as E)} ${counts[kind]}`);
    }
  }
  if (formattedRange) {
    parts.push(`@ ${formattedRange}`);
  }
  return parts.join(" ");
};

export const email = (
  events: eventTypes.Event[],
  useEmoji = false,
  abbreviateAddress = false
): [string, string] => {
  const lines = format(events, useEmoji, abbreviateAddress);

  let subject;
  let text;

  if (lines.length === 1) {
    subject = lines[0];
    text = "";
  } else {
    subject = summary(events, useEmoji);
    text = lines.join("\n");
  }

  return [subject, text];
};
