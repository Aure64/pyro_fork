/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  checkBlockAccusationsForDoubleBake,
  checkBlockAccusationsForDoubleEndorsement,
  checkBlockBakingRights,
  checkBlockEndorsingRights,
  loadBlockRights,
} from "./bm-proto-h";
import { setLevel } from "loglevel";
import {
  responseWithPriorityZero,
  priorityZero,
  priorityZeroOtherBaker,
} from "./testFixtures/h/baking";
import {
  endorsementsWithMiss,
  endorsementsWithSuccess,
  endorsingRightsResponse,
  baker as endorsementBaker,
  level as endorsementLevel,
  operationsWithDoubleEndorsementAccusation,
  operationsWithDoubleBakeAccusation,
} from "./testFixtures/h/endorsing";

setLevel("SILENT");

import { RpcClient } from "rpc/client";

import { Events } from "./events";

const { delegate } = priorityZero;

describe("checkBlockBakingRights", () => {
  it("returns success for baked blocks", () => {
    const result = checkBlockBakingRights({
      baker: delegate,
      blockBaker: delegate,
      blockId: "some_block",
      bakingRights: [priorityZero],
      blockPriority: 0,
    });
    expect(result).toEqual(Events.Baked);
  });

  it("returns missed block baked by other baker", () => {
    const rights = [
      {
        level: 1298433,
        delegate: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
        priority: 0,
      },
      {
        level: 1298441,
        delegate: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
        priority: 1,
      },
    ];
    const result = checkBlockBakingRights({
      baker: rights[0].delegate,
      blockBaker: rights[1].delegate,
      blockId: "some_block",
      bakingRights: rights,
      blockPriority: 1,
    });
    expect(result).toEqual(Events.MissedBake);
  });

  it("returns none for a block that our baker has no rights for", () => {
    const result = checkBlockBakingRights({
      baker: delegate,
      blockBaker: "other_baker",
      blockId: "some_block",
      bakingRights: [priorityZeroOtherBaker],
      blockPriority: 0,
    });
    expect(result).toBe(null);
  });
});

describe("loadBlockRights", () => {
  it("fetches baking and endorsing rights", async () => {
    const getBakingRights = jest.fn().mockResolvedValue({});
    const getEndorsingRights = jest.fn().mockResolvedValue({});
    const rpc = {
      getBakingRights,
      getEndorsingRights,
    } as unknown as RpcClient;

    await loadBlockRights("some_hash", 123, 0, rpc);

    expect(getBakingRights.mock.calls.length).toEqual(1);
    expect(getEndorsingRights.mock.calls.length).toEqual(1);
  });

  it("throws error for failed block data fetch", async () => {
    const getBakingRights = jest.fn().mockResolvedValue({});
    const getEndorsingRights = jest.fn().mockRejectedValue(new Error());
    const rpc = {
      getBakingRights,
      getEndorsingRights,
    } as unknown as RpcClient;

    const blockId = "some_hash";

    await expect(loadBlockRights(blockId, 123, 0, rpc)).rejects.toThrow();
  });
});

describe("checkBlockEndorsingRights", () => {
  it("returns success when present in rights and endorsement was made", () => {
    const result = checkBlockEndorsingRights({
      baker: endorsementBaker,
      endorsementOperations: endorsementsWithSuccess,
      level: endorsementLevel,
      endorsingRights: endorsingRightsResponse,
    });
    expect(result).toEqual([Events.Endorsed, 1]);
  });

  it("returns missed when present in rights but no endorsement was made", () => {
    const result = checkBlockEndorsingRights({
      baker: endorsementBaker,
      endorsementOperations: endorsementsWithMiss,
      level: endorsementLevel,
      endorsingRights: endorsingRightsResponse,
    });
    expect(result).toEqual([Events.MissedEndorsement, 1]);
  });

  it("returns none when not in rights and endorsement was not made", () => {
    const result = checkBlockEndorsingRights({
      baker: "another_baker",
      endorsementOperations: endorsementsWithMiss,
      level: endorsementLevel + 1,
      endorsingRights: endorsingRightsResponse,
    });
    expect(result).toBe(null);
  });

  it("returns none when in rights but with different level and endorsement was not made", () => {
    const result = checkBlockEndorsingRights({
      baker: endorsementBaker,
      endorsementOperations: endorsementsWithMiss,
      level: 12,
      endorsingRights: endorsingRightsResponse,
    });
    expect(result).toBe(null);
  });
});

describe("checkBlockAccusationsForDoubleEndorsement", () => {
  it("returns double endorsement when baker is accused", async () => {
    const getBlock = jest.fn().mockResolvedValue({
      hash: "some_hash",
      operations: [endorsementsWithSuccess],
    });
    const rpc = {
      getBlock,
    } as unknown as RpcClient;

    const result = await checkBlockAccusationsForDoubleEndorsement({
      baker: endorsementBaker,
      rpc,
      operations: operationsWithDoubleEndorsementAccusation,
    });
    expect(result).toEqual(true);
  });
  it("Does not fetch block when there are no accusations", async () => {
    const getBlock = jest.fn();
    const rpc = {
      getBlock,
    } as unknown as RpcClient;

    const result = await checkBlockAccusationsForDoubleEndorsement({
      baker: endorsementBaker,
      rpc,
      operations: [],
    });
    expect(result).toEqual(false);
    expect(getBlock.mock.calls.length).toEqual(0);
  });
});

describe("checkBlockAccusationsForDoubleBake", () => {
  it("returns double bake when baker is accused", async () => {
    const getBakingRights = jest
      .fn()
      .mockResolvedValue(responseWithPriorityZero);
    const rpc = {
      getBakingRights,
    } as unknown as RpcClient;

    const result = await checkBlockAccusationsForDoubleBake({
      baker: delegate,
      rpc,
      operations: operationsWithDoubleBakeAccusation,
    });
    expect(result).toEqual(true);
  });
  it("Does not fetch baking rights when there are no accusations", async () => {
    const getBlock = jest.fn();
    const rpc = {
      getBlock,
    } as unknown as RpcClient;

    const result = await checkBlockAccusationsForDoubleBake({
      baker: delegate,
      rpc,
      operations: [],
    });
    expect(result).toEqual(false);
    expect(getBlock.mock.calls.length).toEqual(0);
  });
});
