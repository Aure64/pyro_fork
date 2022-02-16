import {
  checkBlockBakingRights,
  checkBlockEndorsingRights,
  checkBlockAccusationsForDoubleBake,
} from "./bm-proto-i";

import { RpcClient } from "rpc/client";

import block93416 from "./testFixtures/i/block93416";
import block93416rights from "./testFixtures/i/block93416rights";
import block93415erights from "./testFixtures/i/block93415erights";

import block93516 from "./testFixtures/i/block93516";
import block93516rights from "./testFixtures/i/block93516rights";

import block93601 from "./testFixtures/i/block93601";
import block93601rights from "./testFixtures/i/block93601rights";

import block96849 from "./testFixtures/i/block96849";

import { Events } from "./events";

describe("checkBlockBakingRights", () => {
  it("returns baked event for block baked by baker with rights at round 0", () => {
    const block = block93416;
    const rights = block93416rights;

    expect(block.header.level).toEqual(rights[0].level);

    const delegate = rights[0].delegate;

    const result = checkBlockBakingRights({
      baker: delegate,
      blockBaker: block.metadata!.baker,
      blockProposer: block.metadata!.proposer,
      blockId: block.hash,
      bakingRights: rights,
      blockPriority: block.header.payload_round,
    });
    expect(result).toEqual(Events.Baked);
  });

  it("returns missed bake for block baked by another baker", () => {
    const block = block93516;
    const rights = block93516rights;
    expect(block.header.level).toEqual(rights[0].level);

    expect(block.header.payload_round).toEqual(1);
    expect(block.metadata!.baker).toEqual(rights[1].delegate);

    const result = checkBlockBakingRights({
      baker: rights[0].delegate,
      blockBaker: block.metadata!.baker,
      blockProposer: block.metadata!.proposer,
      blockId: block.hash,
      bakingRights: rights,
      blockPriority: block.header.payload_round,
    });
    expect(result).toEqual(Events.MissedBake);
  });

  it("returns baked event for block baked by baker in round 1", () => {
    const block = block93516;
    const rights = block93516rights;
    expect(block.metadata?.level_info.level).toEqual(rights[0].level);

    expect(block.header.payload_round).toEqual(1);
    expect(block.metadata!.baker).toEqual(rights[1].delegate);

    const result = checkBlockBakingRights({
      baker: rights[1].delegate,
      blockBaker: block.metadata!.baker,
      blockProposer: block.metadata!.proposer,
      blockId: block.hash,
      bakingRights: rights,
      blockPriority: block.header.payload_round,
    });
    expect(result).toEqual(Events.Baked);
  });

  it("returns null for a block that baker has no rights for", () => {
    const block = block93416;
    const rights = block93416rights;
    expect(block.header.level).toEqual(rights[0].level);

    const result = checkBlockBakingRights({
      baker: "some baker",
      blockBaker: block.metadata!.baker,
      blockProposer: block.metadata!.proposer,
      blockId: block.hash,
      bakingRights: rights,
      blockPriority: block.header.payload_round,
    });
    expect(result).toBe(null);
  });

  //We limit max_round when querying baking rights, so rights for rounds
  //later than block's actual round won't be given to the checker function,
  //but it shouldn't make the assumption
  it("returns null for a block that baker has rights for in a later round", () => {
    const block = block93601;
    const rights = block93601rights;
    expect(block.header.level).toEqual(rights[0].level);
    expect(rights[rights.length - 1].round).toEqual(
      block.header.payload_round + 1
    );

    const result = checkBlockBakingRights({
      baker: rights[rights.length - 1].delegate,
      blockBaker: block.metadata!.baker,
      blockProposer: block.metadata!.proposer,
      blockId: block.hash,
      bakingRights: rights,
      blockPriority: block.header.payload_round,
    });
    expect(result).toBe(null);
  });

  it("returns missed bonus event for a block where baker and proposer are not the same", () => {
    const rights = block93516rights;
    const block = {
      ...block93516,
      metadata: { ...block93516.metadata, proposer: rights[0].delegate },
    };
    expect(block.header.level).toEqual(rights[0].level);

    expect(block.header.payload_round).toEqual(1);
    expect(block.metadata!.baker).toEqual(rights[1].delegate);

    const result = checkBlockBakingRights({
      baker: rights[0].delegate,
      blockBaker: block.metadata!.baker!,
      blockProposer: block.metadata!.proposer,
      blockId: block.hash,
      bakingRights: rights,
      blockPriority: block.header.payload_round,
    });
    expect(result).toBe(Events.MissedBonus);
  });
});

describe("checkBlockEndorsingRights", () => {
  it("returns endorsed event when present in rights and endorsement was made", () => {
    const block = block93416;
    const rights = block93415erights;
    expect(block.header.level - 1).toEqual(rights[0].level);

    const result = checkBlockEndorsingRights({
      baker: "tz1MeT8NACB8Q4uV9dPQ3YxXBmYgapbxQxQ5",
      endorsementOperations: block.operations[0],
      level: block.header.level - 1,
      endorsingRights: rights,
    });
    expect(result).toEqual([Events.Endorsed, 780]);
  });

  it("returns missed endorsement event when present in rights but not in block operations", () => {
    const block = block93416;
    const rights = block93415erights;
    expect(block.header.level - 1).toEqual(rights[0].level);

    const result = checkBlockEndorsingRights({
      baker: "tz1evTDcDb1Da5z9reoNRjx5ZXoPXS3D1K1A",
      endorsementOperations: block.operations[0],
      level: block.header.level - 1,
      endorsingRights: rights,
    });
    expect(result).toEqual([Events.MissedEndorsement, 9]);
  });

  it("returns none when not in rights and not in block operations", () => {
    const block = block93416;
    const rights = [
      {
        ...block93415erights[0],
        delegates: [...block93415erights[0].delegates],
      },
    ];
    expect(block.header.level - 1).toEqual(rights[0].level);

    const delegate3 = rights[0].delegates[3];
    const baker = "tz1evTDcDb1Da5z9reoNRjx5ZXoPXS3D1K1A";
    expect(delegate3.delegate).toEqual(baker);

    delegate3.delegate = "some other address";

    const result = checkBlockEndorsingRights({
      baker,
      endorsementOperations: block.operations[0],
      level: block.header.level - 1,
      endorsingRights: rights,
    });

    expect(result).toBe(null);
  });
});

describe("checkBlockAccusationsForDoubleBake", () => {
  it("returns double bake when baker is accused", async () => {
    const getBakingRights = jest.fn().mockResolvedValue([
      {
        level: 96848,
        delegate: "tz3Q67aMz7gSMiQRcW729sXSfuMtkyAHYfqc",
        round: 0,
      },
      {
        level: 96848,
        delegate: "tz1evTDcDb1Da5z9reoNRjx5ZXoPXS3D1K1A",
        round: 1,
      },
      {
        level: 96848,
        delegate: "tz1RuHDSj9P7mNNhfKxsyLGRDahTX5QD1DdP",
        round: 2,
      },
      {
        level: 96848,
        delegate: "tz1aWXP237BLwNHJcCD4b3DutCevhqq2T1Z9",
        round: 3,
      },
    ]);
    const rpc = {
      getBakingRights,
    } as unknown as RpcClient;

    const block = block96849;

    const result = await checkBlockAccusationsForDoubleBake({
      baker: "tz3Q67aMz7gSMiQRcW729sXSfuMtkyAHYfqc",
      rpc,
      operations: block.operations[2],
    });
    expect(result).toEqual(true);
  });

  it("Does not fetch baking rights when there are no accusations", async () => {
    const block = block93416;
    const getBakingRights = jest.fn();
    const rpc = {
      getBakingRights,
    } as unknown as RpcClient;

    const result = await checkBlockAccusationsForDoubleBake({
      baker: block.metadata!.baker,
      rpc,
      operations: block.operations[2],
    });
    expect(result).toEqual(false);
    expect(getBakingRights.mock.calls.length).toEqual(0);
  });
});
