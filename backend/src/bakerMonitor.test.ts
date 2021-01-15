import { checkBlockBakingRights, getBlockBakingEvents } from "./bakerMonitor";
import { BakingRightsResponse, RpcClient } from "@taquito/rpc";
import { mocked } from "ts-jest";

describe("checkBlockBakingRights", () => {
  it("returns success for baked blocks", () => {
    const bakingRightsResponse: BakingRightsResponse = [
      { level: 42, delegate: "our_baker", priority: 0 },
    ];
    const result = checkBlockBakingRights({
      baker: "our_baker",
      blockBaker: "our_baker",
      blockLevel: 42,
      bakingRightsResponse,
    });
    expect(result).toBe("SUCCESS");
  });

  it("returns missed for 0 priority baked by other baker", () => {
    const bakingRightsResponse: BakingRightsResponse = [
      { level: 42, delegate: "our_baker", priority: 0 },
    ];
    const result = checkBlockBakingRights({
      baker: "our_baker",
      blockBaker: "other_baker",
      blockLevel: 42,
      bakingRightsResponse,
    });
    expect(result).toBe("MISSED");
  });

  it("returns none for a block that isn't priority 0 for our baker", () => {
    const bakingRightsResponse: BakingRightsResponse = [
      { level: 42, delegate: "our_baker", priority: 1 },
    ];
    const result = checkBlockBakingRights({
      baker: "our_baker",
      blockBaker: "other_baker",
      blockLevel: 42,
      bakingRightsResponse,
    });
    expect(result).toBe("NONE");
  });

  describe("getBlockBakingEvents", () => {
    it("fetches baking rights from rpc", () => {
      const rpc: RpcClient = ({
        getBakingRights: jest
          .fn()
          .mockResolvedValue([
            { level: 42, delegate: "our_baker", priority: 0 },
          ]),
      } as unknown) as RpcClient;

      const result = getBlockBakingEvents({
        blockLevel: 42,
        baker: "our_baker",
        blockHash: "some_hash",
        cycle: 100,
        blockBaker: "our_baker",
        rpc,
      });
      return expect(result).resolves.toEqual({
        baker: "our_baker",
        kind: "SUCCESSFUL_BAKE",
        message: "Baker baked for block some_hash",
        type: "BAKER",
      });
    });

    it("returns error for failed metadata fetch", () => {
      const rpc: RpcClient = ({
        getBakingRights: jest
          .fn()
          .mockRejectedValue(new Error("Network error")),
      } as unknown) as RpcClient;

      const result = getBlockBakingEvents({
        blockLevel: 42,
        baker: "our_baker",
        blockHash: "some_hash",
        cycle: 100,
        blockBaker: "our_baker",
        rpc,
      });
      return expect(result).resolves.toEqual({
        baker: "our_baker",
        kind: "GET_BAKING_RIGHTS_ERROR",
        message: "Network error",
        type: "BAKER",
      });
    });
  });
});
