/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  checkBlockBakingRights,
  checkBlockEndorsingRights,
  checkBlockAccusationsForDoubleBake,
  checkBlockAccusationsForDoubleEndorsement,
} from "./bm-proto-k";

import {
  DoubleBakingEvidenceK,
  DoubleEndorsementEvidenceK,
  OperationK,
} from "./rpc/types";

import block93416 from "./testFixtures/k/block93416";
import block93416rights from "./testFixtures/k/block93416rights";
import block93415erights from "./testFixtures/k/block93415erights";

import block93516 from "./testFixtures/k/block93516";
import block93516rights from "./testFixtures/k/block93516rights";

import block93601 from "./testFixtures/k/block93601";
import block93601rights from "./testFixtures/k/block93601rights";

import block96849 from "./testFixtures/k/block96849";

import { Events } from "./events";

import { setLevel } from "loglevel";
setLevel("SILENT");

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
  it("returns true when block contains baker accusation", async () => {
    const block = block96849;

    const result = await checkBlockAccusationsForDoubleBake(
      "tz3Q67aMz7gSMiQRcW729sXSfuMtkyAHYfqc",
      block.operations[2]
    );
    expect(result).toEqual(true);
  });

  it("returns false when a different baker is accused", async () => {
    const block = block96849;

    const result = await checkBlockAccusationsForDoubleBake(
      "some other baker",
      block.operations[2]
    );
    expect(result).toEqual(false);
  });

  it("returns false when block contains accusation without metadata", async () => {
    const block = block96849;
    const evidence = block.operations[2][0];
    const contents0 = evidence.contents[0] as DoubleBakingEvidenceK;
    expect(contents0.kind).toEqual("double_baking_evidence");

    const evidenceNoMetadata = {
      ...evidence,
      contents: [
        { kind: contents0.kind, bh1: contents0.bh1, bh2: contents0.bh2 },
      ],
    };

    const result = await checkBlockAccusationsForDoubleBake(
      "tz3Q67aMz7gSMiQRcW729sXSfuMtkyAHYfqc",
      [evidenceNoMetadata]
    );
    expect(result).toEqual(false);
  });

  it("returns false when block contains no accusation", async () => {
    const block = block93416;
    expect(block.operations[2].length).toEqual(0);

    const result = await checkBlockAccusationsForDoubleBake(
      block.metadata!.baker,
      block.operations[2]
    );
    expect(result).toEqual(false);
  });
});

describe("checkBlockAccusationsForDoubleEndorsement", () => {
  const evidence: OperationK = {
    protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
    chain_id: "NetXKMbjQL2SBox",
    hash: "ooDS6XHoTYeK9U7QnmueJQgpCvbwueBKoBBGNNHDr6pkhUMznKe",
    branch: "BLw6hXMmr3MGhWGhRymixheA6hr9MEV25raYxtFCZuH3fFEPwFH",
    contents: [
      {
        kind: "double_endorsement_evidence",
        op1: {
          branch: "BLp4CJWDknMh3wusD5DyGTqmkXCenbe1NREH1icBXVh15CuNn8Z",
          operations: {
            kind: "endorsement",
            level: 51,
            slot: 1,
            round: 1,
            block_payload_hash: "5ca1ab1e",
          },
          signature:
            "sigkmyPhgZ2aMXDXcxycQN6CXmYG7ECgoDxbYAT1sfmJEqYSkvwf97ox8PzedJy6kRU5CvBdCzQGQgjp4N3y3MwqtAWgPAir",
        },
        op2: {
          branch: "BLw6hXMmr3MGhWGhRymixheA6hr9MEV25raYxtFCZuH3fFEPwFH",
          operations: {
            kind: "endorsement",
            level: 51,
            slot: 1,
            round: 1,
            block_payload_hash: "ca11ab1e",
          },
          signature:
            "sigcpANnqCCwyW3DdmGTF1ZN4ihCx66yUrUiaEyuSPS9MMt1xGApwSpJQas7VNMQq1j7ZXZNF1bbWRB2y3okxaFHR4pX16ir",
        },
        slot: 1,
        metadata: {
          balance_updates: [
            {
              kind: "freezer",
              category: "deposits",
              delegate: "tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU",
              change: "-1920000000",
              origin: "block",
            },
          ],
        },
      } as DoubleEndorsementEvidenceK,
    ],
    signature:
      "sigW9mQYjwV3S38PzP1nTwDjRRUGj9857yoh5QRJwHWGyNR6CcS2jAaEXFHUg3UHr2idZ8Ywxddy2iZEva4Dztgo9GnPcCgA",
  };

  it("returns event if baker is accused", async () => {
    const result = await checkBlockAccusationsForDoubleEndorsement(
      "tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU",
      [evidence]
    );
    expect(result).toEqual(Events.DoubleEndorsed);

    const contents0 = evidence.contents[0] as DoubleEndorsementEvidenceK;

    const doublepreEndorsementEvidence = {
      ...evidence,
      contents: [
        {
          ...contents0,
          kind: "double_preendorsement_evidence" as "double_endorsement_evidence",
        },
      ],
    };

    const result2 = await checkBlockAccusationsForDoubleEndorsement(
      "tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU",
      [doublepreEndorsementEvidence]
    );
    expect(result2).toEqual(Events.DoublePreendorsed);
  });

  it("returns null if different baker is accused", async () => {
    const result = await checkBlockAccusationsForDoubleEndorsement(
      "some other baker",
      [evidence]
    );
    expect(result).toEqual(null);
  });

  it("returns null if no metadata is included in accusation", async () => {
    const contents0 = evidence.contents[0] as DoubleEndorsementEvidenceK;

    const evidenceNoMetadata = {
      ...evidence,
      contents: [
        { kind: contents0.kind, op1: contents0.op1, op2: contents0.op2 },
      ],
    };

    const result = await checkBlockAccusationsForDoubleEndorsement(
      "tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU",
      [evidenceNoMetadata]
    );
    expect(result).toEqual(null);
  });

  it("returns null when there are no accusations", async () => {
    const result = await checkBlockAccusationsForDoubleEndorsement(
      "some baker",
      []
    );
    expect(result).toEqual(null);
  });
});
