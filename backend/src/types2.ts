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

export type BakedEvent = BlockEvent & { kind: "baked" };

export type MissedBakedEvent = BlockEvent & { kind: "missed_bake" };

export type DoubleBakedEvent = BlockEvent & { kind: "double_baked" };

export type EndorsedEvent = BlockEvent & { kind: "endorsed" };

export type MissedEndorsementEvent = BlockEvent & {
  kind: "missed_endorsement";
};

export type DoubleEndorsedEvent = BlockEvent & { kind: "double_endorsed" };

export type BakeScheduled = BlockEvent & {
  kind: "bake_scheduled";
  priority: number;
  estimatedTime: Date;
};

export type EndorsementScheduled = BlockEvent & {
  kind: "endorsement_scheduled";
  estimatedTime: Date;
};

export type DeactivatedEvent = CycleEvent & { kind: "deactivated" };

export type DeactivationRiskEvent = CycleEvent & { kind: "deactivation_risk" };

export type BakerEvent =
  | BakedEvent
  | MissedBakedEvent
  | DoubleBakedEvent
  | EndorsedEvent
  | MissedEndorsementEvent
  | DoubleEndorsedEvent
  | BakeScheduled
  | EndorsementScheduled
  | DeactivatedEvent
  | DeactivationRiskEvent;

export type BasicNodeEvent = BasicEvent & { node: string };

export type NodeBehindEvent = BasicNodeEvent & { kind: "node_behind" };

export type NodeSyncedEvent = BasicNodeEvent & { kind: "node_synced" };

export type NodeOnBranchEvent = BasicNodeEvent & { kind: "node_on_branch" };

export type NodeLowPeersEvent = BasicNodeEvent & { kind: "node_low_peers" };

export type NodeEvent =
  | NodeBehindEvent
  | NodeSyncedEvent
  | NodeOnBranchEvent
  | NodeLowPeersEvent;

export type RpcErrorEvent = BasicNodeEvent & {
  kind: "rpc_error";
  message: string;
};

export type RpcErrorResolvedEvent = BasicNodeEvent & {
  kind: "rpc_error_resolved";
};

export type RpcEvent = RpcErrorEvent | RpcErrorResolvedEvent;

export type Notification = BasicEvent & {
  kind: "notification";
  message: string;
};

export type Event = RpcEvent | NodeEvent | BakerEvent | Notification;
