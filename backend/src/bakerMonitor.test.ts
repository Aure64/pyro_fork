import {
  checkBlockAccusationsForDoubleBake,
  checkBlockAccusationsForDoubleEndorsement,
  checkBlockBakingRights,
  checkBlockEndorsingRights,
  checkForDeactivations,
  loadBlockRights,
} from "./bm-proto-h";
import { setLevel } from "loglevel";
import {
  responseWithPriorityZero,
  priorityZero,
  priorityZeroOtherBaker,
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

import { Delegate } from "rpc/types";
import { RpcClient } from "rpc/client";

import { Events } from "./events";

const { delegate } = priorityZero;

Date.now = jest.fn(() => 1624758855227);

const createdAt = new Date(Date.now());

describe("checkBlockBakingRights", () => {
  it("returns success for baked blocks", () => {
    const result = checkBlockBakingRights({
      baker: delegate,
      blockBaker: delegate,
      blockId: "some_block",
      bakingRight: priorityZero,
      blockPriority: 0,
    });
    expect(result).toEqual(Events.Baked);
  });

  it("returns missed block baked by other baker", () => {
    const result = checkBlockBakingRights({
      baker: delegate,
      blockBaker: "other_baker",
      blockId: "some_block",
      bakingRight: priorityZero,
      blockPriority: 0,
    });
    expect(result).toEqual(Events.MissedBake);
  });

  it("returns none for a block that our baker has no rights for", () => {
    const result = checkBlockBakingRights({
      baker: delegate,
      blockBaker: "other_baker",
      blockId: "some_block",
      bakingRight: priorityZeroOtherBaker,
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

describe("checkForDeactivations", () => {
  const baseDelegatesResponse: Delegate = {
    voting_power: 1,
    balance: "1000",
    frozen_balance: "0",
    frozen_balance_by_cycle: [],
    staking_balance: "1000",
    deactivated: false,
    grace_period: 1010,
    delegated_balance: "0",
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
