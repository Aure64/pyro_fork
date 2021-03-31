export type BakerNodeEventKind =
  | "MISSED_BAKE"
  | "SUCCESSFUL_BAKE"
  | "DOUBLE_BAKE"
  | "MISSED_ENDORSE"
  | "SUCCESSFUL_ENDORSE"
  | "DOUBLE_ENDORSE";

type FutureBakingEvent = {
  kind: "FUTURE_BAKING_OPPORTUNITY" | "FUTURE_ENDORSING_OPPORTUNITY";
  type: "BAKER";
  message: string;
  baker: string;
  level: number;
  date: Date;
};

type BakerDataEvent = {
  type: "BAKER_DATA";
  kind: "ERROR" | "RECONNECTED";
  message: string;
};

export type BakerNodeEvent =
  | FutureBakingEvent
  | {
      kind: BakerNodeEventKind;
      type: "BAKER";
      message: string;
      baker: string;
    }
  | BakerDataEvent;

type NodeDataEvent = {
  type: "PEER_DATA";
  kind: "ERROR" | "RECONNECTED";
  message: string;
};

export type PeerNodeEventKind =
  | "NODE_BEHIND"
  | "NODE_CAUGHT_UP"
  | "NODE_ON_A_BRANCH"
  | "NODE_LOW_PEERS";

export type PeerNodeEvent =
  | {
      kind: PeerNodeEventKind;
      type: "PEER";
      message: string;
      node: string;
    }
  | NodeDataEvent;

export type TezosNodeEvent = BakerNodeEvent | PeerNodeEvent;

export type NotifierEvent = {
  type: "NOTIFIER";
  channelName: string;
  message: string;
};

export type NotifyResult =
  | { kind: "SUCCESS" }
  | { kind: "ERROR"; error: Error; channelName: string };

export type Notify<T> = (notifier: T, message: string) => Promise<NotifyResult>;
export type NotifyFunction = (message: string) => Promise<NotifyResult>;
export type NotifyEventFunction = (
  event: TezosNodeEvent | NotifierEvent
) => Promise<NotifyResult>;
export type NotificationChannelMiddleware = (
  notifyFunction: NotifyEventFunction
) => NotifyEventFunction;

export type Result<T> =
  | { type: "SUCCESS"; data: T }
  | { type: "ERROR"; message: string };
