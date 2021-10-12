import { Events } from "./events";
import { checkBlockInfo, BootstrappedStatus } from "./nodeMonitor";
import { history } from "./testFixtures/nodeMonitoring";

Date.now = jest.fn(() => 1624758855227);

const createdAt = new Date(Date.now());

describe("checkBlockInfo", () => {
  test("returns event when node is behind", async () => {
    const bootstrappedStatus: BootstrappedStatus = {
      bootstrapped: true,
      sync_state: "unsynced",
    };
    const node = "http://somenode";
    const head = "some_block";
    const peerCount = 20;
    const nodeInfo = {
      head,
      bootstrappedStatus,
      history,
      peerCount,
      updatedAt: new Date(),
      url: node,
    };
    const previousNodeInfo = undefined;
    const referenceNodeBlockHistory = undefined;
    const events = checkBlockInfo({
      node,
      nodeInfo,
      previousNodeInfo,
      referenceNodeBlockHistory,
    });
    expect(events).toEqual([
      {
        kind: Events.NodeBehind,
        node: "http://somenode",
        createdAt,
      },
    ]);
  });

  test("returns empty events when node behind was previously detected", async () => {
    const bootstrappedStatus: BootstrappedStatus = {
      bootstrapped: true,
      sync_state: "unsynced",
    };
    const node = "http://somenode";
    const head = "some_block";
    const peerCount = 20;
    const nodeInfo = {
      head,
      bootstrappedStatus,
      history,
      peerCount,
      updatedAt: new Date(),
      url: node,
    };

    const previousNodeInfo = {
      head: "some other block",
      bootstrappedStatus,
      history,
      peerCount: 3,
      updatedAt: new Date(),
      url: node,
    };
    const referenceNodeBlockHistory = undefined;
    const events = checkBlockInfo({
      node,
      nodeInfo,
      previousNodeInfo,
      referenceNodeBlockHistory,
    });
    expect(events).toEqual([]);
  });

  test("returns empty events when node is synced", async () => {
    const bootstrappedStatus: BootstrappedStatus = {
      bootstrapped: true,
      sync_state: "synced",
    };
    const node = "http://somenode";
    const head = "some_block";
    const peerCount = 20;
    const nodeInfo = {
      head,
      bootstrappedStatus,
      history: [],
      peerCount,
      updatedAt: new Date(),
      url: node,
    };
    const previousNodeInfo = undefined;
    const referenceNodeBlockHistory = undefined;
    const events = checkBlockInfo({
      node,
      nodeInfo,
      previousNodeInfo,
      referenceNodeBlockHistory,
    });
    expect(events).toEqual([]);
  });

  test("returns empty events when node is unsynced, but still bootstrapping", async () => {
    const bootstrappedStatus: BootstrappedStatus = {
      bootstrapped: false,
      sync_state: "unsynced",
    };
    const node = "http://somenode";
    const head = "some_block";
    const peerCount = 20;
    const nodeInfo = {
      head,
      bootstrappedStatus,
      history: [],
      peerCount,
      updatedAt: new Date(),
      url: node,
    };
    const previousNodeInfo = undefined;
    const referenceNodeBlockHistory = undefined;
    const events = checkBlockInfo({
      node,
      nodeInfo,
      previousNodeInfo,
      referenceNodeBlockHistory,
    });
    expect(events).toEqual([]);
  });

  test("returns caught up event when node is synced but previously wasn't", async () => {
    const bootstrappedStatus: BootstrappedStatus = {
      bootstrapped: true,
      sync_state: "synced",
    };
    const node = "http://somenode";
    const head = "some_block";
    const peerCount = 20;
    const nodeInfo = {
      head,
      bootstrappedStatus,
      history: [],
      peerCount,
      updatedAt: new Date(),
      url: node,
    };
    const oldHead = "some_older_block";
    const oldBootstrappedStatus: BootstrappedStatus = {
      bootstrapped: true,
      sync_state: "unsynced",
    };
    const previousNodeInfo = {
      head: oldHead,
      bootstrappedStatus: oldBootstrappedStatus,
      history: [],
      peerCount,
      updatedAt: new Date(),
      url: node,
    };
    const referenceNodeBlockHistory = undefined;
    const events = checkBlockInfo({
      node,
      nodeInfo,
      previousNodeInfo,
      referenceNodeBlockHistory,
    });
    expect(events).toEqual([
      {
        kind: Events.NodeSynced,
        node: "http://somenode",
        createdAt,
      },
    ]);
  });

  test("returns branch warning when no shared ancestors with reference node", () => {
    const bootstrappedStatus: BootstrappedStatus = {
      bootstrapped: true,
      sync_state: "synced",
    };
    const node = "http://somenode";
    const head = "some_block";
    const peerCount = 20;
    const nodeInfo = {
      head,
      bootstrappedStatus,
      history: [],
      peerCount,
      updatedAt: new Date(),
      url: node,
    };
    const previousNodeInfo = undefined;
    const referenceNodeBlockHistory = history;
    const events = checkBlockInfo({
      node,
      nodeInfo,
      previousNodeInfo,
      referenceNodeBlockHistory,
    });
    expect(events).toEqual([
      {
        kind: Events.NodeOnBranch,
        node: "http://somenode",
        createdAt,
      },
    ]);
  });

  test("returns no events when no shared ancestors with reference node but still syncing", () => {
    const bootstrappedStatus: BootstrappedStatus = {
      bootstrapped: false,
      sync_state: "unsynced",
    };
    const node = "http://somenode";
    const head = "some_block";
    const peerCount = 20;
    const nodeInfo = {
      head,
      bootstrappedStatus,
      history: [],
      peerCount,
      updatedAt: new Date(),
      url: node,
    };
    const previousNodeInfo = undefined;
    const referenceNodeBlockHistory = history;
    const events = checkBlockInfo({
      node,
      nodeInfo,
      previousNodeInfo,
      referenceNodeBlockHistory,
    });
    expect(events).toEqual([]);
  });

  test("returns no events when shared ancestors with reference node is one block away", () => {
    // history minus last item
    const partialHistory = history.slice(0, -1);
    const bootstrappedStatus: BootstrappedStatus = {
      bootstrapped: true,
      sync_state: "synced",
    };
    const node = "http://somenode";
    const head = "some_block";
    const peerCount = 20;
    const nodeInfo = {
      head,
      bootstrappedStatus,
      history: partialHistory,
      peerCount,
      updatedAt: new Date(),
      url: node,
    };
    const previousNodeInfo = undefined;
    const referenceNodeBlockHistory = history;
    const events = checkBlockInfo({
      node,
      nodeInfo,
      previousNodeInfo,
      referenceNodeBlockHistory,
    });
    expect(events).toEqual([]);
  });

  test("returns low peer event when node has less than 10 peers", async () => {
    const bootstrappedStatus: BootstrappedStatus = {
      bootstrapped: true,
      sync_state: "synced",
    };
    const node = "http://somenode";
    const head = "some_block";
    const peerCount = 9;
    const nodeInfo = {
      head,
      bootstrappedStatus,
      history: [],
      peerCount,
      updatedAt: new Date(),
      url: node,
    };
    const previousNodeInfo = undefined;
    const referenceNodeBlockHistory = undefined;
    const events = checkBlockInfo({
      node,
      nodeInfo,
      previousNodeInfo,
      referenceNodeBlockHistory,
    });
    expect(events).toEqual([
      {
        kind: Events.NodeLowPeers,
        node: "http://somenode",
        createdAt,
      },
    ]);
  });

  test("returns no events when node has less than 10 peers but previously had low peers", async () => {
    const bootstrappedStatus: BootstrappedStatus = {
      bootstrapped: true,
      sync_state: "synced",
    };
    const node = "http://somenode";
    const head = "some_block";
    const peerCount = 9;
    const nodeInfo = {
      head,
      bootstrappedStatus,
      history: [],
      peerCount,
      updatedAt: new Date(),
      url: node,
    };
    const previousNodeInfo = nodeInfo;
    const referenceNodeBlockHistory = undefined;
    const events = checkBlockInfo({
      node,
      nodeInfo,
      previousNodeInfo,
      referenceNodeBlockHistory,
    });
    expect(events).toEqual([]);
  });
});
