export type BakerNodeEvent = { kind: string; message: string };
export type PeerNodeEvent = { kind: string; message: string };

export type TezosNodeEvent = BakerNodeEvent | PeerNodeEvent;

export type NotifyResult =
  | { kind: "success" }
  | { kind: "error"; error: Error };

export type Notify<T> = (
  notifier: T,
  event: TezosNodeEvent
) => Promise<NotifyResult>;
