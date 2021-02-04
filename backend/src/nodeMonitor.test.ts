import { checkBlockInfo, BootstrappedStatus } from "./nodeMonitor";

describe("checkBlockInfo", () => {
  test("returns event when node is behind", async () => {
    const bootstrappedStatus: BootstrappedStatus = {
      bootstrapped: true,
      sync_state: "unsynced",
    };
    const node = "http://somenode";
    const head = "some_block";
    const nodeInfo = { head, bootstrappedStatus };
    const previousNodeInfo = undefined;
    const events = checkBlockInfo({
      node,
      nodeInfo,
      previousNodeInfo,
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
    const nodeInfo = { head, bootstrappedStatus };
    const previousNodeInfo = undefined;
    const events = checkBlockInfo({
      node,
      nodeInfo,
      previousNodeInfo,
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
    const nodeInfo = { head, bootstrappedStatus };
    const previousNodeInfo = undefined;
    const events = checkBlockInfo({
      node,
      nodeInfo,
      previousNodeInfo,
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
    const nodeInfo = { head, bootstrappedStatus };
    const oldHead = "some_older_block";
    const oldBootstrappedStatus: BootstrappedStatus = {
      bootstrapped: true,
      sync_state: "unsynced",
    };
    const previousNodeInfo = {
      head: oldHead,
      bootstrappedStatus: oldBootstrappedStatus,
    };
    const events = checkBlockInfo({
      node,
      nodeInfo,
      previousNodeInfo,
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
});
