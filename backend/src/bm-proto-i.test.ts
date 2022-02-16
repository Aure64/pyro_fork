import { checkBlockBakingRights } from "./bm-proto-i";

import block93416 from "./testFixtures/i/block93416";
import block93416rights from "./testFixtures/i/block93416rights";
import block93516 from "./testFixtures/i/block93516";
import block93516rights from "./testFixtures/i/block93516rights";

import block93601 from "./testFixtures/i/block93601";
import block93601rights from "./testFixtures/i/block93601rights";

import { Events } from "./events";

describe("checkBlockBakingRights", () => {
  it("returns baked event for block baked by baker with rights at round 0", () => {
    const block = block93416;
    const rights = block93416rights;

    expect(block.metadata?.level_info.level).toEqual(rights[0].level);

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
    expect(block.metadata?.level_info.level).toEqual(rights[0].level);

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
    expect(block.metadata?.level_info.level).toEqual(rights[0].level);

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
    expect(block.metadata?.level_info.level).toEqual(rights[0].level);
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
    expect(block.metadata!.level_info!.level).toEqual(rights[0].level);

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
