import { Events } from "./events";
import { checkBlockInfo } from "./nodeMonitor";
import { BootstrappedStatus } from "./rpc/types";

Date.now = jest.fn(() => 1624758855227);

const createdAt = new Date(Date.now());

const createNodeInfo = () => {
  const bootstrappedStatus: BootstrappedStatus = {
    bootstrapped: true,
    sync_state: "unsynced",
  };

  return {
    url: "http://somenode",
    head: "some_block",
    peerCount: 20,
    endpoints: {
      status: true,
      networkConnections: true,
      version: true,
    },
    unableToReach: false,
    updatedAt: new Date(),
    bootstrappedStatus,
    error: undefined,
    tezosVersion: undefined,
    history: [],
  };
};

describe("checkBlockInfo", () => {
  test("returns event when node is behind", async () => {
    const nodeInfo = createNodeInfo();
    const previousNodeInfo = undefined;
    const events = checkBlockInfo({
      nodeInfo,
      previousNodeInfo,
      lowPeerCount: 10,
    });
    expect(events).toEqual([
      {
        kind: Events.NodeBehind,
        node: nodeInfo.url,
        createdAt,
      },
    ]);
  });

  test("returns empty events when node behind was previously detected", async () => {
    const bootstrappedStatus: BootstrappedStatus = {
      bootstrapped: true,
      sync_state: "unsynced",
    };
    const nodeInfo = createNodeInfo();

    const previousNodeInfo = {
      ...createNodeInfo(),
      head: "some other block",
      bootstrappedStatus,
      url: nodeInfo.url,
    };
    const events = checkBlockInfo({
      nodeInfo,
      previousNodeInfo,
      lowPeerCount: 5,
    });
    expect(events).toEqual([]);
  });

  test("returns empty events when node is synced", async () => {
    const bootstrappedStatus: BootstrappedStatus = {
      bootstrapped: true,
      sync_state: "synced",
    };
    const nodeInfo = {
      ...createNodeInfo(),
      bootstrappedStatus,
    };
    const previousNodeInfo = undefined;
    const events = checkBlockInfo({
      nodeInfo,
      previousNodeInfo,
      lowPeerCount: 5,
    });
    expect(events).toEqual([]);
  });

  test("returns empty events when node is unsynced, but still bootstrapping", async () => {
    const bootstrappedStatus: BootstrappedStatus = {
      bootstrapped: false,
      sync_state: "unsynced",
    };
    const nodeInfo = { ...createNodeInfo(), bootstrappedStatus };
    const previousNodeInfo = undefined;
    const events = checkBlockInfo({
      nodeInfo,
      previousNodeInfo,
      lowPeerCount: 5,
    });
    expect(events).toEqual([]);
  });

  test("returns caught up event when node is synced but previously wasn't", async () => {
    const bootstrappedStatus: BootstrappedStatus = {
      bootstrapped: true,
      sync_state: "synced",
    };

    const nodeInfo = {
      ...createNodeInfo(),
      bootstrappedStatus,
    };
    const oldHead = "some_older_block";
    const oldBootstrappedStatus: BootstrappedStatus = {
      bootstrapped: true,
      sync_state: "unsynced",
    };

    const previousNodeInfo = {
      ...createNodeInfo(),
      head: oldHead,
      bootstrappedStatus: oldBootstrappedStatus,
    };

    const events = checkBlockInfo({
      nodeInfo,
      previousNodeInfo,
      lowPeerCount: 5,
    });
    expect(events).toEqual([
      {
        kind: Events.NodeSynced,
        node: "http://somenode",
        createdAt,
      },
    ]);
  });

  test("returns low peer event when node has low peer count", async () => {
    const bootstrappedStatus: BootstrappedStatus = {
      bootstrapped: true,
      sync_state: "synced",
    };
    const peerCount = 7;

    const nodeInfo = {
      ...createNodeInfo(),
      bootstrappedStatus,
      peerCount,
    };

    const previousNodeInfo = undefined;
    const events = checkBlockInfo({
      nodeInfo,
      previousNodeInfo,
      lowPeerCount: 7,
    });
    expect(events).toEqual([
      {
        kind: Events.NodeLowPeers,
        node: "http://somenode",
        createdAt,
      },
    ]);
  });

  test("returns no events when node has low peer count and had low peer count previously", async () => {
    const bootstrappedStatus: BootstrappedStatus = {
      bootstrapped: true,
      sync_state: "synced",
    };
    const peerCount = 9;
    const nodeInfo = {
      ...createNodeInfo(),
      bootstrappedStatus,
      peerCount,
    };

    const previousNodeInfo = nodeInfo;
    const events = checkBlockInfo({
      nodeInfo,
      previousNodeInfo,
      lowPeerCount: 9,
    });
    expect(events).toEqual([]);
  });

  test("returns low peer count resolved when node has good peer count after low peer count", async () => {
    const bootstrappedStatus: BootstrappedStatus = {
      bootstrapped: true,
      sync_state: "synced",
    };

    const lowPeerCount = 8;

    const previousNodeInfo = {
      ...createNodeInfo(),
      bootstrappedStatus,
      peerCount: lowPeerCount,
    };

    const nodeInfo = { ...previousNodeInfo, peerCount: lowPeerCount + 1 };
    const events = checkBlockInfo({
      nodeInfo,
      previousNodeInfo,
      lowPeerCount,
    });
    expect(events).toEqual([
      {
        kind: Events.NodeLowPeersResolved,
        node: "http://somenode",
        createdAt,
      },
    ]);
  });
});
