import {
  getConnectionChangeEvent,
  shouldNotify,
  updateStatus,
} from "./offlineFilter";
import { PeerEvent, PeerNodeEvent, TezosNodeEvent } from "../types";

describe("shouldNotify", () => {
  it("rejects baker error events when baker monitor is offline", () => {
    const result = shouldNotify(
      {
        channelName: "desktop",
        status: {
          consecutiveNodeMonitorFailures: 5,
          consecutiveBakerMonitorFailures: 5,
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
          consecutiveNodeMonitorFailures: 5,
          consecutiveBakerMonitorFailures: 5,
        },
      },
      { type: "PEER_DATA", kind: "ERROR", message: "some error" }
    );
    expect(result).toEqual(false);
  });
});

describe("updateStatus", () => {
  it("increments consecutiveBakerMonitorFailures for baker errors", () => {
    const status = {
      consecutiveNodeMonitorFailures: 0,
      consecutiveBakerMonitorFailures: 0,
    };
    const bakeEvent: TezosNodeEvent = {
      type: "BAKER_DATA",
      kind: "ERROR",
      message: "some error",
    };
    const result = updateStatus(status, bakeEvent);

    expect(result).toEqual({
      consecutiveNodeMonitorFailures: 0,
      consecutiveBakerMonitorFailures: 1,
    });
  });

  it("resets consecutiveBakerMonitorFailures to 0 for baker success", () => {
    const status = {
      consecutiveNodeMonitorFailures: 1,
      consecutiveBakerMonitorFailures: 1,
    };
    const bakeEvent: TezosNodeEvent = {
      type: "FUTURE_BAKING",
      kind: "FUTURE_BAKING_OPPORTUNITY",
      message: "some message",
      level: 900,
      baker: "some baker",
      date: new Date(),
    };
    const result = updateStatus(status, bakeEvent);

    expect(result).toEqual({
      consecutiveNodeMonitorFailures: 1,
      consecutiveBakerMonitorFailures: 0,
    });
  });

  it("increments consecutiveNodeMonitorFailures for node errors", () => {
    const status = {
      consecutiveNodeMonitorFailures: 0,
      consecutiveBakerMonitorFailures: 0,
    };
    const peerEvent: PeerEvent = {
      type: "PEER_DATA",
      kind: "ERROR",
      message: "some error",
    };
    const result = updateStatus(status, peerEvent);

    expect(result).toEqual({
      consecutiveNodeMonitorFailures: 1,
      consecutiveBakerMonitorFailures: 0,
    });
  });

  it("resets consecutiveNodeMonitorFailures to 0 for node success", () => {
    const status = {
      consecutiveNodeMonitorFailures: 1,
      consecutiveBakerMonitorFailures: 1,
    };
    const peerEvent: PeerNodeEvent = {
      type: "PEER",
      kind: "NODE_CAUGHT_UP",
      message: "some error",
      node: "some_node",
    };
    const result = updateStatus(status, peerEvent);

    expect(result).toEqual({
      consecutiveNodeMonitorFailures: 0,
      consecutiveBakerMonitorFailures: 1,
    });
  });
});

describe("getConnectionChangeEvent", () => {
  const offlineNode = {
    consecutiveBakerMonitorFailures: 0,
    consecutiveNodeMonitorFailures: 5,
  };
  const offlineBaker = {
    consecutiveBakerMonitorFailures: 5,
    consecutiveNodeMonitorFailures: 0,
  };
  const onlineNode = {
    consecutiveBakerMonitorFailures: 5,
    consecutiveNodeMonitorFailures: 0,
  };
  const onlineBaker = {
    consecutiveBakerMonitorFailures: 0,
    consecutiveNodeMonitorFailures: 5,
  };
  it("returns event when baker monitor goes offline", () => {
    getConnectionChangeEvent(onlineBaker, offlineBaker);
  });
  it("returns event when baker monitor comes back online", () => {
    getConnectionChangeEvent(offlineBaker, onlineBaker);
  });
  it("returns null when baker monitor is still offline", () => {
    getConnectionChangeEvent(offlineBaker, offlineBaker);
  });
  it("returns null when baker monitor is still online", () => {
    getConnectionChangeEvent(onlineBaker, onlineBaker);
  });
  it("returns event when node monitor goes offline", () => {
    getConnectionChangeEvent(onlineNode, offlineNode);
  });
  it("returns event when node monitor comes back online", () => {
    getConnectionChangeEvent(offlineNode, onlineNode);
  });
  it("returns null when node monitor is still offline", () => {
    getConnectionChangeEvent(offlineNode, offlineNode);
  });
  it("returns null when node monitor is still online", () => {
    getConnectionChangeEvent(onlineNode, onlineNode);
  });
});
