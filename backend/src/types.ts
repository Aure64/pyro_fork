export type BakerNodeEvent = { kind: string; message: string };
export type PeerNodeEvent = { kind: string; message: string };

export type TezosNodeEvent = BakerNodeEvent | PeerNodeEvent;

export type NotifyResult = "success" | { error: Error };

export type Notify<T> = (
  notifier: T,
  event: TezosNodeEvent
) => Promise<NotifyResult>;
