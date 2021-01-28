import { checkBlockByHash } from "./nodeMonitor";
import { RpcClient } from "@taquito/rpc";
import { enableFetchMocks } from "jest-fetch-mock";
import fetchMock from "jest-fetch-mock";

enableFetchMocks();

describe("checkBlockByHash", () => {
  const rpc = ({} as unknown) as RpcClient;

  test("returns event when node is behind", async () => {
    fetchMock.mockResponse(
      JSON.stringify({ bootstrapped: true, sync_state: "unsynced" })
    );
    const events = await checkBlockByHash({
      node: "http://somenode",
      rpc,
      blockHash: "some_hash",
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
    fetchMock.mockResponse(
      JSON.stringify({ bootstrapped: true, sync_state: "synced" })
    );
    const events = await checkBlockByHash({
      node: "http://somenode",
      rpc,
      blockHash: "some_hash",
    });
    expect(events).toEqual([]);
  });

  test("returns empty events when node is unsynced, but still bootstrapping", async () => {
    fetchMock.mockResponse(
      JSON.stringify({ bootstrapped: false, sync_state: "unsynced" })
    );
    const events = await checkBlockByHash({
      node: "http://somenode",
      rpc,
      blockHash: "some_hash",
    });
    expect(events).toEqual([]);
  });
});
