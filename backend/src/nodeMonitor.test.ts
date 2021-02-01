import { checkBlockByHash } from "./nodeMonitor";
import { RpcClient } from "@taquito/rpc";
import { enableFetchMocks } from "jest-fetch-mock";

enableFetchMocks();

describe("checkBlockByHash", () => {
  const rpc = ({} as unknown) as RpcClient;

  test("returns event when node is behind", async () => {
    const status = { bootstrapped: true, sync_state: "unsynced" };
    fetchMock.mockResponse(JSON.stringify(status));
    const events = await checkBlockByHash({
      node: "http://somenode",
      rpc,
      blockHash: "some_hash",
      previousStatus: undefined,
    });
    expect(events).toEqual({
      events: [
        {
          kind: "NODE_BEHIND",
          node: "http://somenode",
          type: "PEER",
          message: "Node is behind",
        },
      ],
      status,
    });
  });

  test("returns empty events when node is synced", async () => {
    const status = { bootstrapped: true, sync_state: "synced" };
    fetchMock.mockResponse(JSON.stringify(status));
    const events = await checkBlockByHash({
      node: "http://somenode",
      rpc,
      blockHash: "some_hash",
      previousStatus: undefined,
    });
    expect(events).toEqual({ events: [], status });
  });

  test("returns empty events when node is unsynced, but still bootstrapping", async () => {
    const status = { bootstrapped: false, sync_state: "unsynced" };
    fetchMock.mockResponse(JSON.stringify(status));
    const events = await checkBlockByHash({
      node: "http://somenode",
      rpc,
      blockHash: "some_hash",
      previousStatus: undefined,
    });
    expect(events).toEqual({ events: [], status });
  });

  test("returns caught up event when node is synced but previously wasn't", async () => {
    const status = { bootstrapped: true, sync_state: "synced" };
    fetchMock.mockResponse(JSON.stringify(status));
    const events = await checkBlockByHash({
      node: "http://somenode",
      rpc,
      blockHash: "some_hash",
      previousStatus: { bootstrapped: true, sync_state: "unsynced" },
    });
    expect(events).toEqual({
      events: [
        {
          kind: "NODE_CAUGHT_UP",
          node: "http://somenode",
          type: "PEER",
          message: "Node caught up",
        },
      ],
      status,
    });
  });
});
