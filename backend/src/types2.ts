export enum Kind {
  Baked = "baked",
  MissedBake = "missed_bake",
  DoubleBaked = "double_baked",
  Endorsed = "endorsed",
  MissedEndorsement = "missed_endorsement",
  DoubleEndorsed = "double_endorsed",
  BakeScheduled = "bake_scheduled",
  EndorsementScheduled = "endosement_scheduled",
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

export type BlockEvent = BasicBakerEvent & {
  level: number;
};

export type CycleEvent = BasicBakerEvent & {
  cycle: number;
};

export type Baked = BlockEvent & { kind: Kind.Baked };

export type MissedBake = BlockEvent & { kind: Kind.MissedBake };

export type DoubleBaked = BlockEvent & { kind: Kind.DoubleBaked };

export type Endorsed = BlockEvent & { kind: Kind.Endorsed };

export type MissedEndorsement = BlockEvent & {
  kind: Kind.MissedEndorsement;
};

export type DoubleEndorsed = BlockEvent & { kind: Kind.DoubleEndorsed };

export type BakeScheduled = BlockEvent & {
  kind: Kind.BakeScheduled;
  priority: number;
  estimatedTime: Date;
};

export type EndorsementScheduled = BlockEvent & {
  kind: Kind.EndorsementScheduled;
  estimatedTime: Date;
};

export type Deactivated = CycleEvent & { kind: Kind.Deactivated };

export type DeactivationRisk = CycleEvent & { kind: Kind.DeactivationRisk };

export type BakerEvent =
  | Baked
  | MissedBake
  | DoubleBaked
  | Endorsed
  | MissedEndorsement
  | DoubleEndorsed
  | BakeScheduled
  | EndorsementScheduled
  | Deactivated
  | DeactivationRisk;

export type BasicNodeEvent = BasicEvent & { node: string };

export type NodeBehind = BasicNodeEvent & { kind: Kind.NodeBehind };

export type NodeSynced = BasicNodeEvent & { kind: Kind.NodeSynced };

export type NodeOnBranch = BasicNodeEvent & { kind: Kind.NodeOnBranch };

export type NodeLowPeers = BasicNodeEvent & { kind: Kind.NodeLowPeers };

export type NodeEvent = NodeBehind | NodeSynced | NodeOnBranch | NodeLowPeers;

export type RpcError = BasicNodeEvent & {
  kind: Kind.RpcError;
  message: string;
};

export type RpcErrorResolved = BasicNodeEvent & {
  kind: Kind.RpcErrorResolved;
};

export type RpcEvent = RpcError | RpcErrorResolved;

export type Notification = BasicEvent & {
  kind: Kind.Notification;
  message: string;
};

export type Event = RpcEvent | NodeEvent | BakerEvent | Notification;

export type Sender = (events: Event[]) => Promise<void>;
