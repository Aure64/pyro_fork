export type BakerNodeEvent = { kind: string };
export type PeerNodeEvent = { kind: string };

export type TezosNodeEvent = BakerNodeEvent | PeerNodeEvent;
