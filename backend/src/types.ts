export type BakerNodeEventKind =
  | "MISSED_BAKE"
  | "SUCCESSFUL_BAKE"
  | "DOUBLE_BAKE"
  | "FUTURE_BAKING_OPPORTUNITY"
  | "MISSED_ENDORSE"
  | "SUCCESSFUL_ENDORSE"
  | "DOUBLE_ENDORSE"
  | "FUTURE_ENDORSING_OPPORTUNITY";

export type BakerNodeEvent = {
  kind: BakerNodeEventKind;
  type: "BAKER";
  message: string;
  baker: string;
};

export type PeerNodeEventKind =
  | "NODE_BEHIND"
  | "UPDATE_ERROR"
  | "NODE_CAUGHT_UP"
  | "NODE_ON_A_BRANCH"
  | "NODE_LOW_PEERS";

export type PeerNodeEvent = {
  kind: PeerNodeEventKind;
  type: "PEER";
  message: string;
  node: string;
};

export type RpcEvent = { kind: string; type: "RPC"; message: string };

export type TezosNodeEvent = BakerNodeEvent | PeerNodeEvent | RpcEvent;

export type NotifyResult =
  | { kind: "SUCCESS" }
  | { kind: "ERROR"; error: Error };

export type Notify<T> = (notifier: T, message: string) => Promise<NotifyResult>;

export type Result<T> =
  | { type: "SUCCESS"; data: T }
  | { type: "ERROR"; message: string };
