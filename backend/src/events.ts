export enum Events {
  Baked = "baked",
  MissedBake = "missed_bake",
  DoubleBaked = "double_baked",
  Endorsed = "endorsed",
  MissedEndorsement = "missed_endorsement",
  DoubleEndorsed = "double_endorsed",
  Deactivated = "deactivated",
  DeactivationRisk = "deactivation_risk",
  NodeBehind = "node_behind",
  NodeSynced = "node_synced",
  NodeOnBranch = "node_on_branch",
  NodeLowPeers = "node_low_peers",
  RpcError = "rpc_error",
  RpcErrorResolved = "rpc_error_resolved",
  Notification = "notification",
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

export type Baked = BlockEvent & { kind: Events.Baked };

export type MissedBake = BlockEvent & { kind: Events.MissedBake };

export type DoubleBaked = BlockEvent & { kind: Events.DoubleBaked };

export type Endorsed = BlockEvent & { kind: Events.Endorsed };

export type MissedEndorsement = BlockEvent & {
  kind: Events.MissedEndorsement;
};

export type DoubleEndorsed = BlockEvent & { kind: Events.DoubleEndorsed };

export type Deactivated = CycleEvent & { kind: Events.Deactivated };

export type DeactivationRisk = CycleEvent & { kind: Events.DeactivationRisk };

export type BakerBlockEvent =
  | Baked
  | MissedBake
  | DoubleBaked
  | Endorsed
  | MissedEndorsement
  | DoubleEndorsed;

export type BakerCycleEvent = Deactivated | DeactivationRisk;

export type BakerEvent = BakerBlockEvent | BakerCycleEvent;

export type BasicNodeEvent = BasicEvent & { node: string };

export type NodeBehind = BasicNodeEvent & { kind: Events.NodeBehind };

export type NodeSynced = BasicNodeEvent & { kind: Events.NodeSynced };

export type NodeOnBranch = BasicNodeEvent & { kind: Events.NodeOnBranch };

export type NodeLowPeers = BasicNodeEvent & { kind: Events.NodeLowPeers };

export type NodeEvent = NodeBehind | NodeSynced | NodeOnBranch | NodeLowPeers;

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
