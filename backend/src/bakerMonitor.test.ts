import {
  checkBlockBakingRights,
  checkBlockEndorsingRights,
  getBlockBakingEvents,
  makeMemoizedGetBakingRights,
} from "./bakerMonitor";
import { setLevel } from "loglevel";
import { responseWithPriorityZero, priorityZero } from "./testFixtures/baking";
import {
  endorsementsWithMiss,
  endorsementsWithSuccess,
  endorsingRightsResponse,
  baker as endorsementBaker,
  level as endorsementLevel,
} from "./testFixtures/endorsing";
setLevel("SILENT");
import { RpcClient } from "@taquito/rpc";

const { delegate, level } = priorityZero;

describe("checkBlockBakingRights", () => {
  it("returns success for baked blocks", () => {
    const result = checkBlockBakingRights({
      baker: delegate,
      blockBaker: delegate,
      blockLevel: level,
      bakingRightsResponse: responseWithPriorityZero,
    });
    expect(result).toBe("SUCCESS");
  });

  it("returns missed for 0 priority baked by other baker", () => {
    const result = checkBlockBakingRights({
      baker: delegate,
      blockBaker: "other_baker",
      blockLevel: level,
      bakingRightsResponse: responseWithPriorityZero,
    });
    expect(result).toBe("MISSED");
  });

  it("returns none for a block that isn't priority 0 for our baker", () => {
    const result = checkBlockBakingRights({
      baker: delegate,
      blockBaker: "other_baker",
      blockLevel: level + 1,
      bakingRightsResponse: responseWithPriorityZero,
    });
    expect(result).toBe("NONE");
  });
});

describe("getBlockBakingEvents", () => {
  it("fetches baking rights from rpc", () => {
    const rpc = ({
      getBakingRights: jest.fn().mockResolvedValue(responseWithPriorityZero),
    } as unknown) as RpcClient;

    const result = getBlockBakingEvents({
      blockLevel: level,
      baker: delegate,
      blockHash: "some_hash",
      cycle: 100,
      blockBaker: delegate,
      rpc,
    });
    return expect(result).resolves.toEqual({
      baker: delegate,
      kind: "SUCCESSFUL_BAKE",
      message:
        "Successful bake for block some_hash for baker tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
      type: "BAKER",
    });
  });

  it("returns error for failed metadata fetch", () => {
    const rpc = ({
      getBakingRights: jest.fn().mockRejectedValue(new Error("Network error")),
    } as unknown) as RpcClient;

    const result = getBlockBakingEvents({
      blockLevel: level,
      baker: delegate,
      blockHash: "some_hash",
      cycle: 100,
      blockBaker: delegate,
      rpc,
    });
    return expect(result).resolves.toEqual({
      baker: delegate,
      kind: "GET_BAKING_RIGHTS_ERROR",
      message: "Network error",
      type: "BAKER",
    });
  });
});

describe("makeMemoizedGetBakingRights", () => {
  it("fetches new data on a first request", async () => {
    const apiCall = jest.fn().mockResolvedValue([]);

    const getBakingRights = makeMemoizedGetBakingRights(apiCall);
    const args = {};

    const result = await getBakingRights(args, { block: "block" });
    expect(result).toEqual([]);
    expect(apiCall.mock.calls.length).toEqual(1);
  });

  it("returns existing data on a cache hit", async () => {
    const apiCall = jest.fn().mockResolvedValue([]);

    const getBakingRights = makeMemoizedGetBakingRights(apiCall);
    const args = {
      max_priority: 0,
      cycle: 199,
      delegate: "some_baker",
    };

    const result = await getBakingRights(args, { block: "block" });
    await getBakingRights(args, { block: "block" });
    await getBakingRights(args, { block: "another_block" });
    await getBakingRights(args, { block: "a different block" });
    expect(result).toEqual([]);
    expect(apiCall.mock.calls.length).toEqual(1);
  });
});

describe("checkBlockEndorsingRights", () => {
  it("returns success when present in rights and endorsement was made", () => {
    const result = checkBlockEndorsingRights({
      baker: endorsementBaker,
      endorsementOperations: endorsementsWithSuccess,
      blockLevel: endorsementLevel + 1,
      endorsingRightsResponse,
    });
    expect(result).toBe("SUCCESS");
  });

  it("returns missed when present in rights but no endorsement was made", () => {
    const result = checkBlockEndorsingRights({
      baker: endorsementBaker,
      endorsementOperations: endorsementsWithMiss,
      blockLevel: endorsementLevel + 1,
      endorsingRightsResponse,
    });
    expect(result).toBe("MISSED");
  });

  it("returns none when not in rights and endorsement was not made", () => {
    const result = checkBlockEndorsingRights({
      baker: "another_baker",
      endorsementOperations: endorsementsWithMiss,
      blockLevel: endorsementLevel + 1,
      endorsingRightsResponse,
    });
    expect(result).toBe("NONE");
  });

  it("returns none when in rights but with different level and endorsement was not made", () => {
    const result = checkBlockEndorsingRights({
      baker: endorsementBaker,
      endorsementOperations: endorsementsWithMiss,
      blockLevel: 12,
      endorsingRightsResponse,
    });
    expect(result).toBe("NONE");
  });
});
