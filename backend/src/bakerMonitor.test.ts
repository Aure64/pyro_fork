import { checkBlockBakingRights, getBlockBakingEvents } from "./bakerMonitor";
import {
  BakingRightsResponse,
  BakingRightsResponseItem,
  RpcClient,
} from "@taquito/rpc";

const responseWithLowerPriorities: BakingRightsResponse = [
  {
    level: 1298433,
    delegate: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
    priority: 24,
  },
  {
    level: 1298441,
    delegate: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
    priority: 62,
  },
  {
    level: 1298449,
    delegate: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
    priority: 37,
  },
  {
    level: 1298454,
    delegate: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
    priority: 13,
  },
  {
    level: 1298460,
    delegate: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
    priority: 47,
  },
  {
    level: 1298465,
    delegate: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
    priority: 19,
  },
  {
    level: 1298475,
    delegate: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
    priority: 52,
  },
  {
    level: 1298476,
    delegate: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
    priority: 25,
  },
  {
    level: 1298490,
    delegate: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
    priority: 25,
  },
  {
    level: 1298498,
    delegate: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
    priority: 46,
  },
];

const priorityZero: BakingRightsResponseItem = {
  level: 1299013,
  delegate: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
  priority: 0,
};

export const responseWithPriorityZero: BakingRightsResponse = [
  ...responseWithLowerPriorities,
  priorityZero,
];

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
      blockLevel: level,
      bakingRightsResponse: responseWithLowerPriorities,
    });
    expect(result).toBe("NONE");
  });

  it("returns none for a 0 priority block that isn't the same level", () => {
    const result = checkBlockBakingRights({
      baker: delegate,
      blockBaker: delegate,
      blockLevel: level + 1,
      bakingRightsResponse: responseWithPriorityZero,
    });
    expect(result).toBe("NONE");
  });
});

describe("getBlockBakingEvents", () => {
  it("fetches baking rights from rpc", () => {
    const rpc: RpcClient = ({
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
      message: "Baker baked for block some_hash",
      type: "BAKER",
    });
  });

  it("returns error for failed metadata fetch", () => {
    const rpc: RpcClient = ({
      getBakingRights: jest.fn().mockRejectedValue(new Error("Network error")),
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
