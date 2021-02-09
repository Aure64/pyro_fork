import { checkBlockInfo, BootstrappedStatus } from "./nodeMonitor";
import { history } from "./testFixtures/nodeMonitoring";

describe("checkBlockInfo", () => {
  test("returns event when node is behind", async () => {
    const bootstrappedStatus: BootstrappedStatus = {
      bootstrapped: true,
      sync_state: "unsynced",
    };
    const node = "http://somenode";
    const head = "some_block";
    const nodeInfo = { head, bootstrappedStatus, history };
    const previousNodeInfo = undefined;
    const referenceNodeInfo = undefined;
    const events = checkBlockInfo({
      node,
      nodeInfo,
      previousNodeInfo,
      referenceNodeInfo,
    });
    expect(events).toEqual([
      {
        kind: "NODE_BEHIND",
        node: "http://somenode",
        type: "PEER",
        message: "Node is behind",
      },
    ]);
  });

  test("returns empty events when node is synced", async () => {
    const bootstrappedStatus: BootstrappedStatus = {
      bootstrapped: true,
      sync_state: "synced",
    };
    const node = "http://somenode";
    const head = "some_block";
    const nodeInfo = { head, bootstrappedStatus, history: [] };
    const previousNodeInfo = undefined;
    const referenceNodeInfo = undefined;
    const events = checkBlockInfo({
      node,
      nodeInfo,
      previousNodeInfo,
      referenceNodeInfo,
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
    const nodeInfo = { head, bootstrappedStatus, history: [] };
    const previousNodeInfo = undefined;
    const referenceNodeInfo = undefined;
    const events = checkBlockInfo({
      node,
      nodeInfo,
      previousNodeInfo,
      referenceNodeInfo,
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
    const nodeInfo = { head, bootstrappedStatus, history: [] };
    const oldHead = "some_older_block";
    const oldBootstrappedStatus: BootstrappedStatus = {
      bootstrapped: true,
      sync_state: "unsynced",
    };
    const previousNodeInfo = {
      head: oldHead,
      bootstrappedStatus: oldBootstrappedStatus,
      history: [],
    };
    const referenceNodeInfo = undefined;
    const events = checkBlockInfo({
      node,
      nodeInfo,
      previousNodeInfo,
      referenceNodeInfo,
    });
    expect(events).toEqual([
      {
        kind: "NODE_CAUGHT_UP",
        node: "http://somenode",
        type: "PEER",
        message: "Node caught up",
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
    const nodeInfo = { head, bootstrappedStatus, history: [] };
    const previousNodeInfo = undefined;
    const referenceNodeInfo = {
      head: "different_head",
      bootstrappedStatus,
      history,
    };
    const events = checkBlockInfo({
      node,
      nodeInfo,
      previousNodeInfo,
      referenceNodeInfo,
    });
    expect(events).toEqual([
      {
        kind: "NODE_ON_A_BRANCH",
        message: "Node http://somenode is on a branch",
        node: "http://somenode",
        type: "PEER",
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
    const nodeInfo = { head, bootstrappedStatus, history: [] };
    const previousNodeInfo = undefined;
    const referenceNodeInfo = {
      head: "different_head",
      bootstrappedStatus,
      history,
    };
    const events = checkBlockInfo({
      node,
      nodeInfo,
      previousNodeInfo,
      referenceNodeInfo,
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
    const nodeInfo = { head, bootstrappedStatus, history: partialHistory };
    const previousNodeInfo = undefined;
    const referenceNodeInfo = {
      head: "different_head",
      bootstrappedStatus,
      history,
    };
    const events = checkBlockInfo({
      node,
      nodeInfo,
      previousNodeInfo,
      referenceNodeInfo,
    });
    expect(events).toEqual([]);
  });
});
