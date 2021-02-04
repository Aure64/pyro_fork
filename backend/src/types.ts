export type BakerNodeEventKind =
  | "GET_METADATA_ERROR"
  | "GET_BAKING_RIGHTS_ERROR"
  | "GET_BLOCK_OPERATIONS_ERROR"
  | "MISSED_BAKE"
  | "SUCCESSFUL_BAKE"
  | "MISSED_ENDORSE"
  | "SUCCESSFUL_ENDORSE";

export type BakerNodeEvent = {
  kind: BakerNodeEventKind;
  type: "BAKER";
  message: string;
  baker: string;
};

export type PeerNodeEventKind =
  | "NODE_BEHIND"
  | "UPDATE_ERROR"
  | "NODE_CAUGHT_UP";

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

export type Notify<T> = (
  notifier: T,
  event: TezosNodeEvent
) => Promise<NotifyResult>;

export type Result<T> =
  | { type: "SUCCESS"; data: T }
  | { type: "ERROR"; message: string };
