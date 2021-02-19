import {
  checkBlockAccusations,
  checkBlockBakingRights,
  checkBlockEndorsingRights,
  loadBlockData,
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
  operationsWithDoubleEndorsementAccusation,
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
      blockHash: "some_block",
      bakingRights: responseWithPriorityZero,
    });
    expect(result).toEqual({
      baker: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
      kind: "SUCCESSFUL_BAKE",
      message:
        "Successful bake for block some_block for baker tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
      type: "BAKER",
    });
  });

  it("returns missed for 0 priority baked by other baker", () => {
    const result = checkBlockBakingRights({
      baker: delegate,
      blockBaker: "other_baker",
      blockLevel: level,
      blockHash: "some_block",
      bakingRights: responseWithPriorityZero,
    });
    expect(result).toEqual({
      baker: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
      kind: "MISSED_BAKE",
      message:
        "Missed bake detected for baker tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
      type: "BAKER",
    });
  });

  it("returns none for a block that isn't priority 0 for our baker", () => {
    const result = checkBlockBakingRights({
      baker: delegate,
      blockBaker: "other_baker",
      blockLevel: level + 1,
      blockHash: "some_block",
      bakingRights: responseWithPriorityZero,
    });
    expect(result).toBe(null);
  });
});

describe("loadBlockData", () => {
  it("fetches bakingRights, endorsingRights, metadata, and block from rpc", async () => {
    const getBakingRights = jest.fn().mockResolvedValue({});
    const getBlockMetadata = jest.fn().mockResolvedValue({ level: {} });
    const getEndorsingRights = jest.fn().mockResolvedValue({});
    const getBlock = jest.fn().mockResolvedValue({});
    const rpc = ({
      getBakingRights,
      getBlock,
      getBlockMetadata,
      getEndorsingRights,
    } as unknown) as RpcClient;

    await loadBlockData({
      bakers: [delegate],
      blockHash: "some_hash",
      rpc,
    });

    expect(getBakingRights.mock.calls.length).toEqual(1);
    expect(getBlock.mock.calls.length).toEqual(1);
    expect(getBlockMetadata.mock.calls.length).toEqual(1);
    expect(getEndorsingRights.mock.calls.length).toEqual(1);
  });

  it("returns error for failed metadata fetch", async () => {
    const getBakingRights = jest.fn().mockResolvedValue({});
    const getBlockMetadata = jest.fn().mockRejectedValue({});
    const getEndorsingRights = jest.fn().mockResolvedValue({});
    const getBlock = jest.fn().mockResolvedValue({});
    const rpc = ({
      getBakingRights,
      getBlock,
      getBlockMetadata,
      getEndorsingRights,
    } as unknown) as RpcClient;

    const result = await loadBlockData({
      bakers: [delegate],
      blockHash: "some_hash",
      rpc,
    });

    expect(result).toEqual({
      type: "ERROR",
      message: "Error loading block metadata",
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
      endorsingRights: endorsingRightsResponse,
    });
    expect(result).toEqual({
      baker: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
      kind: "SUCCESSFUL_ENDORSE",
      message:
        "Successful endorse for baker tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
      type: "BAKER",
    });
  });

  it("returns missed when present in rights but no endorsement was made", () => {
    const result = checkBlockEndorsingRights({
      baker: endorsementBaker,
      endorsementOperations: endorsementsWithMiss,
      blockLevel: endorsementLevel + 1,
      endorsingRights: endorsingRightsResponse,
    });
    expect(result).toEqual({
      baker: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
      kind: "MISSED_ENDORSE",
      message: "Missed endorse for baker tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
      type: "BAKER",
    });
  });

  it("returns none when not in rights and endorsement was not made", () => {
    const result = checkBlockEndorsingRights({
      baker: "another_baker",
      endorsementOperations: endorsementsWithMiss,
      blockLevel: endorsementLevel + 1,
      endorsingRights: endorsingRightsResponse,
    });
    expect(result).toBe(null);
  });

  it("returns none when in rights but with different level and endorsement was not made", () => {
    const result = checkBlockEndorsingRights({
      baker: endorsementBaker,
      endorsementOperations: endorsementsWithMiss,
      blockLevel: 12,
      endorsingRights: endorsingRightsResponse,
    });
    expect(result).toBe(null);
  });
});

describe("checkBlockAccusations", () => {
  it("returns double endorsement when baker is accused", async () => {
    const getBlock = jest.fn().mockResolvedValue({
      hash: "some_hash",
      operations: [endorsementsWithSuccess],
    });
    const rpc = ({
      getBlock,
    } as unknown) as RpcClient;

    const result = await checkBlockAccusations({
      baker: endorsementBaker,
      rpc,
      operations: operationsWithDoubleEndorsementAccusation,
    });
    expect(result).toEqual([
      {
        baker: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
        kind: "DOUBLE_ENDORSE",
        message:
          "Double endorsement for baker tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1 at block some_hash",
        type: "BAKER",
      },
    ]);
  });
  it("Does not fetch block when there are no accusations", async () => {
    const getBlock = jest.fn();
    const rpc = ({
      getBlock,
    } as unknown) as RpcClient;

    const result = await checkBlockAccusations({
      baker: endorsementBaker,
      rpc,
      operations: [],
    });
    expect(result).toEqual([]);
    expect(getBlock.mock.calls.length).toEqual(0);
  });
});
