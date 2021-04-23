import { shouldNotify, updateStatus } from "./offlineFilter";
import { PeerEvent, PeerNodeEvent, TezosNodeEvent } from "../types";

describe("shouldNotify", () => {
  it("rejects baker error events when baker monitor is offline", () => {
    const result = shouldNotify(
      {
        channelName: "desktop",
        status: {
          isNodeMonitorOffline: false,
          isBakerMonitorOffline: true,
        },
      },
      { type: "BAKER_DATA", kind: "ERROR", message: "some error" }
    );
    expect(result).toEqual(false);
  });

  it("rejects node error events when node monitor is offline", () => {
    const result = shouldNotify(
      {
        channelName: "desktop",
        status: {
          isNodeMonitorOffline: true,
          isBakerMonitorOffline: false,
        },
      },
      { type: "PEER_DATA", kind: "ERROR", message: "some error" }
    );
    expect(result).toEqual(false);
  });
});

describe("updateStatus", () => {
  it("updates isBakerMonitorOffline to true for baker errors", () => {
    const status = {
      isNodeMonitorOffline: false,
      isBakerMonitorOffline: false,
    };
    const bakeEvent: TezosNodeEvent = {
      type: "BAKER_DATA",
      kind: "ERROR",
      message: "some error",
    };
    const result = updateStatus(status, bakeEvent);

    expect(result).toEqual({
      isNodeMonitorOffline: false,
      isBakerMonitorOffline: true,
    });
  });

  it("updates isBakerMonitorOffline to false for baker success", () => {
    const status = {
      isNodeMonitorOffline: false,
      isBakerMonitorOffline: false,
    };
    const bakeEvent: TezosNodeEvent = {
      type: "FUTURE_BAKING",
      kind: "FUTURE_BAKING_OPPORTUNITY",
      message: "some error",
      level: 900,
      baker: "some baker",
      date: new Date(),
    };
    const result = updateStatus(status, bakeEvent);

    expect(result).toEqual({
      isNodeMonitorOffline: false,
      isBakerMonitorOffline: false,
    });
  });

  it("updates isNodeMonitorOffline to true for node errors", () => {
    const status = {
      isNodeMonitorOffline: false,
      isBakerMonitorOffline: false,
    };
    const peerEvent: PeerEvent = {
      type: "PEER_DATA",
      kind: "ERROR",
      message: "some error",
    };
    const result = updateStatus(status, peerEvent);

    expect(result).toEqual({
      isBakerMonitorOffline: false,
      isNodeMonitorOffline: true,
    });
  });

  it("updates isNodeMonitorOffline to false for node success", () => {
    const status = {
      isNodeMonitorOffline: true,
      isBakerMonitorOffline: false,
    };
    const peerEvent: PeerNodeEvent = {
      type: "PEER",
      kind: "NODE_CAUGHT_UP",
      message: "some error",
      node: "some_node",
    };
    const result = updateStatus(status, peerEvent);

    expect(result).toEqual({
      isBakerMonitorOffline: false,
      isNodeMonitorOffline: false,
    });
  });
});
