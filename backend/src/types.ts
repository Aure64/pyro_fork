import { Union, Literal, Static } from "runtypes";

/**
 * This module declares types shared through the various modules.  Some of the
 * types are defined using the runtypes library.  This extra step allows them
 * to be logged at runtime to inform users of the available options.
 */

const BakerNodeEventKind_RT = Union(
  Literal("MISSED_BAKE"),
  Literal("SUCCESSFUL_BAKE"),
  Literal("DOUBLE_BAKE"),
  Literal("MISSED_ENDORSE"),
  Literal("SUCCESSFUL_ENDORSE"),
  Literal("DOUBLE_ENDORSE")
);

export type BakerNodeEventKind = Static<typeof BakerNodeEventKind_RT>;

export type BakerNodeEvent = {
  kind: BakerNodeEventKind;
  type: "BAKER_NODE";
  message: string;
  baker: string;
  blockLevel: number;
};
const FutureBakingEventKind_RT = Union(
  Literal("FUTURE_BAKING_OPPORTUNITY"),
  Literal("FUTURE_ENDORSING_OPPORTUNITY")
);

export type FutureBakingEventKind = Static<typeof FutureBakingEventKind_RT>;

export type FutureBakingEvent = {
  kind: FutureBakingEventKind;
  type: "FUTURE_BAKING";
  message: string;
  baker: string;
  level: number;
  date: Date;
};

export type BakerDeactivationEventKind =
  | "BAKER_DEACTIVATED"
  | "BAKER_PENDING_DEACTIVATION";

export type BakerDeactivationEvent = {
  kind: BakerDeactivationEventKind;
  type: "BAKER_DEACTIVATION";
  message: string;
  baker: string;
  cycle: number;
};

const DataEventKind_RT = Union(Literal("ERROR"), Literal("RECONNECTED"));

export type DataEventKind = Static<typeof DataEventKind_RT>;

export type BakerEvent =
  | FutureBakingEvent
  | BakerNodeEvent
  | BakerDeactivationEvent;

export type PeerDataEvent = {
  type: "PEER_DATA";
  kind: DataEventKind;
  message: string;
  node: string;
};

const PeerNodeEventKind_RT = Union(
  Literal("NODE_BEHIND"),
  Literal("NODE_CAUGHT_UP"),
  Literal("NODE_ON_A_BRANCH"),
  Literal("NODE_LOW_PEERS")
);

export type PeerNodeEventKind = Static<typeof PeerNodeEventKind_RT>;

export type PeerNodeEvent = {
  kind: PeerNodeEventKind;
  type: "PEER";
  message: string;
  node: string;
};

export type PeerEvent = PeerNodeEvent | PeerDataEvent;

export type TezosNodeEvent = BakerEvent | PeerEvent;

export type Sender = (events: TezosNodeEvent[]) => Promise<void>;

export type Message = {
  title: string;
  message: string;
};

export type NotifierEvent = {
  type: "NOTIFIER";
  channelName: string;
  message: string;
};

export type NotifyResult =
  | { kind: "SUCCESS" }
  | { kind: "ERROR"; error: Error; channelName: string };

export type Notify<T> = (
  notifier: T,
  message: Message
) => Promise<NotifyResult>;
export type NotifyFunction = (message: Message) => Promise<NotifyResult>;
export type NotifyEventFunction = (
  event: TezosNodeEvent | NotifierEvent
) => Promise<NotifyResult>;
export type NotificationChannelMiddleware = (
  notifyFunction: NotifyEventFunction
) => NotifyEventFunction;

// iterate through the various event kinds that we want to expose in docs
const generateEventKinds = () => {
  const bakerEventKinds = BakerNodeEventKind_RT.alternatives.map(
    (lit) => lit.value
  );
  const dataEventKinds = DataEventKind_RT.alternatives.map((lit) => lit.value);
  const peerEventKinds = PeerNodeEventKind_RT.alternatives.map(
    (lit) => lit.value
  );
  const futureBakingEventKinds = FutureBakingEventKind_RT.alternatives.map(
    (lit) => lit.value
  );

  return [
    ...bakerEventKinds,
    ...dataEventKinds,
    ...peerEventKinds,
    ...futureBakingEventKinds,
  ];
};
export const eventKinds = generateEventKinds();
