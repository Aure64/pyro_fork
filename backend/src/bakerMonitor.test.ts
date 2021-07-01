import {
  checkBlockAccusationsForDoubleBake,
  checkBlockAccusationsForDoubleEndorsement,
  checkBlockBakingRights,
  checkBlockEndorsingRights,
  checkFutureBlockBakingRights,
  checkFutureBlockEndorsingRights,
  checkForDeactivations,
  loadBlockData,
} from "./bakerMonitor";
import { setLevel } from "loglevel";
import {
  responseWithPriorityZero,
  priorityZero,
  levelWithMultipleBakers,
} from "./testFixtures/baking";
import {
  endorsementsWithMiss,
  endorsementsWithSuccess,
  endorsingRightsResponse,
  baker as endorsementBaker,
  level as endorsementLevel,
  operationsWithDoubleEndorsementAccusation,
  operationsWithDoubleBakeAccusation,
} from "./testFixtures/endorsing";
setLevel("SILENT");
import { DelegatesResponse, RpcClient } from "@taquito/rpc";
import { BigNumber } from "bignumber.js";

import { Kind as Events } from "./types2";

const { delegate, level } = priorityZero;

Date.now = jest.fn(() => 1624758855227);

const createdAt = new Date(Date.now());

describe("checkBlockBakingRights", () => {
  it("returns success for baked blocks", () => {
    const result = checkBlockBakingRights({
      baker: delegate,
      blockBaker: delegate,
      level,
      blockId: "some_block",
      bakingRights: responseWithPriorityZero,
    });
    expect(result).toEqual({
      baker: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
      level: 1299013,
      kind: Events.Baked,
      createdAt,
    });
  });

  it("returns missed for 0 priority baked by other baker", () => {
    const result = checkBlockBakingRights({
      baker: delegate,
      blockBaker: "other_baker",
      level,
      blockId: "some_block",
      bakingRights: responseWithPriorityZero,
    });
    expect(result).toEqual({
      baker: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
      level: 1299013,
      kind: Events.MissedBake,
      createdAt,
    });
  });

  it("returns none for a block that isn't priority 0 for our baker", () => {
    const result = checkBlockBakingRights({
      baker: delegate,
      blockBaker: "other_baker",
      level: levelWithMultipleBakers,
      blockId: "some_block",
      bakingRights: responseWithPriorityZero,
    });
    expect(result).toBe(null);
  });
});

describe("loadBlockData", () => {
  it("fetches bakingRights, endorsingRights and block from rpc", async () => {
    const getBakingRights = jest.fn().mockResolvedValue({});
    const getBlockMetadata = jest.fn().mockResolvedValue({ level: {} });
    const getEndorsingRights = jest.fn().mockResolvedValue({});
    const getBlock = jest
      .fn()
      .mockResolvedValue({ metadata: { level_info: { level: 123 } } });
    const rpc = {
      getBakingRights,
      getBlock,
      getBlockMetadata,
      getEndorsingRights,
    } as unknown as RpcClient;

    await loadBlockData({
      bakers: [delegate],
      blockId: "some_hash",
      rpc,
    });

    expect(getBakingRights.mock.calls.length).toEqual(1);
    expect(getBlock.mock.calls.length).toEqual(1);
    //metadata included in block
    expect(getBlockMetadata.mock.calls.length).toEqual(0);
    expect(getEndorsingRights.mock.calls.length).toEqual(1);
  });

  it("throws error for failed block data fetch", async () => {
    const getBakingRights = jest.fn().mockResolvedValue({});
    // const getBlockMetadata = jest.fn().mockRejectedValue({});
    const getEndorsingRights = jest.fn().mockResolvedValue({});
    const getBlock = jest.fn().mockRejectedValue(new Error());
    const getConstants = jest.fn().mockResolvedValue({});
    const rpc = {
      getBakingRights,
      getBlock,
      // getBlockMetadata,
      getEndorsingRights,
      getConstants,
    } as unknown as RpcClient;

    const blockId = "some_hash";

    await expect(
      loadBlockData({
        bakers: [delegate],
        blockId,
        rpc,
      })
    ).rejects.toThrow();
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
    expect(result).toEqual({
      baker: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
      level: 1318230,
      kind: Events.Endorsed,
      createdAt,
    });
  });

  it("returns missed when present in rights but no endorsement was made", () => {
    const result = checkBlockEndorsingRights({
      baker: endorsementBaker,
      endorsementOperations: endorsementsWithMiss,
      level: endorsementLevel,
      endorsingRights: endorsingRightsResponse,
    });
    expect(result).toEqual({
      baker: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
      level: 1318230,
      kind: Events.MissedEndorsement,
      createdAt,
    });
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
      level: 1000,
    });
    expect(result).toEqual({
      baker: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
      level: 1000,
      kind: Events.DoubleEndorsed,
      createdAt,
    });
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
      level: 1000,
    });
    expect(result).toEqual(null);
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
      level: 1000,
    });
    expect(result).toEqual({
      baker: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
      level: 1000,
      kind: Events.DoubleBaked,
      createdAt,
    });
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
      level: 1000,
    });
    expect(result).toEqual(null);
    expect(getBlock.mock.calls.length).toEqual(0);
  });
});

describe("checkFutureBlockBakingRights", () => {
  it("returns event when baker has baking rights for future blocks", () => {
    const result = checkFutureBlockBakingRights({
      baker: delegate,
      blockBaker: delegate,
      blockLevel: level - 10,
      bakingRights: responseWithPriorityZero,
      timeBetweenBlocks: 60,
    });
    expect(result).toMatchObject({
      baker: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
      kind: Events.BakeScheduled,
      createdAt,
    });
  });

  it("returns null when baker has no future baking opportunities", () => {
    const result = checkFutureBlockBakingRights({
      baker: delegate,
      blockBaker: "other_baker",
      blockLevel: level + 1,
      bakingRights: responseWithPriorityZero,
      timeBetweenBlocks: 60,
    });
    expect(result).toBe(null);
  });
});

describe("checkFutureBlockEndorsingRights", () => {
  it("returns event when endorser has endorsing rights for future blocks", () => {
    const result = checkFutureBlockEndorsingRights({
      baker: delegate,
      blockLevel: 1318220,
      endorsingRights: endorsingRightsResponse,
      timeBetweenBlocks: 60,
    });
    expect(result).toMatchObject({
      baker: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
      kind: Events.EndorsementScheduled,
      createdAt,
    });
  });

  it("returns null when endorser has no future endorsing opportunities", () => {
    const result = checkFutureBlockEndorsingRights({
      baker: delegate,
      blockLevel: 1318240,
      endorsingRights: endorsingRightsResponse,
      timeBetweenBlocks: 60,
    });
    expect(result).toBe(null);
  });
});

describe("checkForDeactivations", () => {
  const baseDelegatesResponse: DelegatesResponse = {
    balance: new BigNumber(1000),
    frozen_balance: new BigNumber(0),
    frozen_balance_by_cycle: [],
    staking_balance: new BigNumber(1000),
    deactivated: false,
    grace_period: 1010,
    delegated_balance: new BigNumber(0),
    delegated_contracts: [],
  };

  it("returns null for bakers in good standing", async () => {
    const cycle = 1000;
    const baker = "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1";
    const delegatesResponse = {
      ...baseDelegatesResponse,
    };
    const result = await checkForDeactivations({
      baker,
      cycle,
      delegatesResponse,
    });
    expect(result).toEqual(null);
  });

  it("returns an event for deactivated bakers", async () => {
    const cycle = 1000;
    const baker = "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1";
    const delegatesResponse = {
      ...baseDelegatesResponse,
      deactivated: true,
    };
    const result = await checkForDeactivations({
      baker,
      cycle,
      delegatesResponse,
    });
    expect(result).toEqual({
      baker: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
      cycle: 1000,
      kind: Events.Deactivated,
      createdAt,
    });
  });

  it("returns an event for bakers pending deactivation", async () => {
    const cycle = 1000;
    const baker = "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1";
    const delegatesResponse = {
      ...baseDelegatesResponse,
      grace_period: 1001,
    };
    const result = await checkForDeactivations({
      baker,
      cycle,
      delegatesResponse,
    });
    expect(result).toEqual({
      baker: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
      cycle: 1001,
      kind: Events.DeactivationRisk,
      createdAt,
    });
  });
});
