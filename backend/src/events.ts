import { getLogger } from "loglevel";

export enum Events {
  Baked = "baked",
  MissedBake = "missed_bake",
  MissedBonus = "missed_bonus",
  DoubleBaked = "double_baked",
  Endorsed = "endorsed",
  MissedEndorsement = "missed_endorsement",
  DoubleEndorsed = "double_endorsed",
  DoublePreendorsed = "double_preendorsed",
  Deactivated = "deactivated",
  DeactivationRisk = "deactivation_risk",
  NodeBehind = "node_behind",
  NodeSynced = "node_synced",
  NodeLowPeers = "low_peer_count",
  NodeLowPeersResolved = "low_peer_count_resolved",
  RpcError = "rpc_error",
  RpcErrorResolved = "rpc_error_resolved",
  Notification = "notification",
  BakerUnhealthy = "baker_unhealthy",
  BakerRecovered = "baker_recovered",
}

export type BasicEvent = {
  createdAt: Date;
};

export type BasicBakerEvent = BasicEvent & {
  baker: string;
};

export type CycleEvent = BasicBakerEvent & {
  cycle: number;
};

export type BlockEvent = BasicBakerEvent &
  CycleEvent & {
    level: number;
    timestamp: Date;
  };

export type BakerUnhealthy = BlockEvent & {
  kind: Events.BakerUnhealthy;
};

export type BakerRecovered = BlockEvent & {
  kind: Events.BakerRecovered;
};

export type BakerHealthEvent = BakerUnhealthy | BakerRecovered;

export type Baked = BlockEvent & { kind: Events.Baked; priority: number };

export type MissedBake = BlockEvent & { kind: Events.MissedBake };

export type MissedBonus = BlockEvent & { kind: Events.MissedBonus };

export type DoubleBaked = BlockEvent & { kind: Events.DoubleBaked };

export type Endorsed = BlockEvent & {
  kind: Events.Endorsed;
  slotCount: number;
};

export type MissedEndorsement = BlockEvent & {
  kind: Events.MissedEndorsement;
  slotCount: number;
};

export type DoubleEndorsed = BlockEvent & { kind: Events.DoubleEndorsed };

export type DoublePreendorsed = BlockEvent & { kind: Events.DoublePreendorsed };

export type Deactivated = CycleEvent & { kind: Events.Deactivated };

export type DeactivationRisk = CycleEvent & { kind: Events.DeactivationRisk };

export type BakerBlockEvent =
  | Baked
  | MissedBake
  | MissedBonus
  | DoubleBaked
  | Endorsed
  | MissedEndorsement
  | DoubleEndorsed
  | DoublePreendorsed;

export type BakerCycleEvent = Deactivated | DeactivationRisk;

export type BakerEvent = BakerBlockEvent | BakerCycleEvent | BakerHealthEvent;

export type BasicNodeEvent = BasicEvent & { node: string };

export type NodeBehind = BasicNodeEvent & { kind: Events.NodeBehind };

export type NodeSynced = BasicNodeEvent & { kind: Events.NodeSynced };

export type NodeLowPeers = BasicNodeEvent & { kind: Events.NodeLowPeers };

export type NodeLowPeersResolved = BasicNodeEvent & {
  kind: Events.NodeLowPeersResolved;
};

export type NodeEvent =
  | NodeBehind
  | NodeSynced
  | NodeLowPeers
  | NodeLowPeersResolved;

export type RpcError = BasicNodeEvent & {
  kind: Events.RpcError;
  message: string;
};

export type RpcErrorResolved = BasicNodeEvent & {
  kind: Events.RpcErrorResolved;
};

export type RpcEvent = RpcError | RpcErrorResolved;

export type Notification = BasicEvent & {
  kind: Events.Notification;
  message: string;
};

export type Event = RpcEvent | NodeEvent | BakerEvent | Notification;

export type Sender = (events: Event[]) => Promise<void>;

export const excludeEvents = (inEvents: Event[], exclude: Events[]) => {
  return inEvents.filter((e) => !exclude.includes(e.kind));
};

export const FilteredSender = (
  sender: Sender,
  config: { exclude: Events[] }
): Sender => {
  return async (inEvents: Event[]) => {
    const events = excludeEvents(inEvents, config.exclude);
    if (events.length !== inEvents.length) {
      getLogger("events").debug(
        `Filtered out ${inEvents.length - events.length}`
      );
    }
    await sender(events);
  };
};
