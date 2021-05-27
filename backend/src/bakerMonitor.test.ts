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

const { delegate, level } = priorityZero;

describe("checkBlockBakingRights", () => {
  it("returns success for baked blocks", () => {
    const result = checkBlockBakingRights({
      baker: delegate,
      blockBaker: delegate,
      blockLevel: level,
      blockId: "some_block",
      bakingRights: responseWithPriorityZero,
    });
    expect(result).toEqual({
      baker: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
      blockLevel: 1299013,
      kind: "SUCCESSFUL_BAKE",
      message:
        "Successful bake for block some_block for baker tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
      type: "BAKER_NODE",
    });
  });

  it("returns missed for 0 priority baked by other baker", () => {
    const result = checkBlockBakingRights({
      baker: delegate,
      blockBaker: "other_baker",
      blockLevel: level,
      blockId: "some_block",
      bakingRights: responseWithPriorityZero,
    });
    expect(result).toEqual({
      baker: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
      blockLevel: 1299013,
      kind: "MISSED_BAKE",
      message:
        "Missed bake detected for baker tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
      type: "BAKER_NODE",
    });
  });

  it("returns none for a block that isn't priority 0 for our baker", () => {
    const result = checkBlockBakingRights({
      baker: delegate,
      blockBaker: "other_baker",
      blockLevel: levelWithMultipleBakers,
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
    const getBlock = jest.fn().mockResolvedValue({ metadata: { level: {} } });
    const rpc = ({
      getBakingRights,
      getBlock,
      getBlockMetadata,
      getEndorsingRights,
    } as unknown) as RpcClient;

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
    const rpc = ({
      getBakingRights,
      getBlock,
      // getBlockMetadata,
      getEndorsingRights,
      getConstants,
    } as unknown) as RpcClient;

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
      blockLevel: endorsementLevel,
      endorsingRights: endorsingRightsResponse,
    });
    expect(result).toEqual({
      baker: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
      blockLevel: 1318230,
      kind: "SUCCESSFUL_ENDORSE",
      message:
        "Successful endorse for baker tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
      type: "BAKER_NODE",
    });
  });

  it("returns missed when present in rights but no endorsement was made", () => {
    const result = checkBlockEndorsingRights({
      baker: endorsementBaker,
      endorsementOperations: endorsementsWithMiss,
      blockLevel: endorsementLevel,
      endorsingRights: endorsingRightsResponse,
    });
    expect(result).toEqual({
      baker: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
      blockLevel: 1318230,
      kind: "MISSED_ENDORSE",
      message:
        "Missed endorse for baker tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1 at level 1318230",
      type: "BAKER_NODE",
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

describe("checkBlockAccusationsForDoubleEndorsement", () => {
  it("returns double endorsement when baker is accused", async () => {
    const getBlock = jest.fn().mockResolvedValue({
      hash: "some_hash",
      operations: [endorsementsWithSuccess],
    });
    const rpc = ({
      getBlock,
    } as unknown) as RpcClient;

    const result = await checkBlockAccusationsForDoubleEndorsement({
      baker: endorsementBaker,
      rpc,
      operations: operationsWithDoubleEndorsementAccusation,
      blockLevel: 1000,
    });
    expect(result).toEqual({
      baker: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
      blockLevel: 1000,
      kind: "DOUBLE_ENDORSE",
      message:
        "Double endorsement for baker tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1 at block some_hash",
      type: "BAKER_NODE",
    });
  });
  it("Does not fetch block when there are no accusations", async () => {
    const getBlock = jest.fn();
    const rpc = ({
      getBlock,
    } as unknown) as RpcClient;

    const result = await checkBlockAccusationsForDoubleEndorsement({
      baker: endorsementBaker,
      rpc,
      operations: [],
      blockLevel: 1000,
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
    const rpc = ({
      getBakingRights,
    } as unknown) as RpcClient;

    const result = await checkBlockAccusationsForDoubleBake({
      baker: delegate,
      rpc,
      operations: operationsWithDoubleBakeAccusation,
      blockLevel: 1000,
    });
    expect(result).toEqual({
      baker: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
      blockLevel: 1000,
      kind: "DOUBLE_BAKE",
      message:
        "Double bake for baker tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1 at level 1299013 with hash opEcYqxb9HYvdQE5jLvazmpdk93f8M7dcQMdh33mpqDQeC3rDdF",
      type: "BAKER_NODE",
    });
  });
  it("Does not fetch baking rights when there are no accusations", async () => {
    const getBlock = jest.fn();
    const rpc = ({
      getBlock,
    } as unknown) as RpcClient;

    const result = await checkBlockAccusationsForDoubleBake({
      baker: delegate,
      rpc,
      operations: [],
      blockLevel: 1000,
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
      kind: "FUTURE_BAKING_OPPORTUNITY",
      message: expect.stringContaining(
        "Future bake opportunity for baker tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1 at level 1299013 in 10 blocks on "
      ),
      type: "FUTURE_BAKING",
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
      kind: "FUTURE_ENDORSING_OPPORTUNITY",
      message: expect.stringContaining(
        "Future endorse opportunity for baker tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1 at level 1318230 in 10 blocks on "
      ),
      type: "FUTURE_BAKING",
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
      kind: "BAKER_DEACTIVATED",
      message:
        "Baker tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1 is deactivated (on or before cycle 1000)",
      type: "BAKER_DEACTIVATION",
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
      kind: "BAKER_PENDING_DEACTIVATION",
      message:
        "Baker tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1 is scheduled for deactivation in cycle 1001",
      type: "BAKER_DEACTIVATION",
    });
  });
});
