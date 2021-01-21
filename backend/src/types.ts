export type BakerNodeEventKind =
  | "GET_METADATA_ERROR"
  | "GET_BAKING_RIGHTS_ERROR"
  | "MISSED_BAKE"
  | "SUCCESSFUL_BAKE";

export type BakerNodeEvent = {
  kind: BakerNodeEventKind;
  type: "BAKER";
  message: string;
  baker: string;
};
export type PeerNodeEvent = { kind: string; type: "PEER"; message: string };

export type RpcEvent = { kind: string; type: "RPC"; message: string };

export type TezosNodeEvent = BakerNodeEvent | PeerNodeEvent | RpcEvent;

export type NotifyResult =
  | { kind: "SUCCESS" }
  | { kind: "ERROR"; error: Error };

export type Notify<T> = (
  notifier: T,
  event: TezosNodeEvent
) => Promise<NotifyResult>;
