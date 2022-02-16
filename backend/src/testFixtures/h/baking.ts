import { BakingRightsH, BakingRightH } from "rpc/types";

export const levelWithMultipleBakers = 1298498;

const responseWithLowerPriorities: BakingRightsH = [
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
    level: levelWithMultipleBakers,
    delegate: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
    priority: 46,
  },
];

export const priorityZero: BakingRightH = {
  level: 1299013,
  delegate: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
  priority: 0,
};

export const priorityZeroOtherBaker: BakingRightH = {
  level: levelWithMultipleBakers,
  delegate: "other_baker",
  priority: 0,
};

export const responseWithPriorityZero: BakingRightH[] = [
  ...responseWithLowerPriorities,
  priorityZeroOtherBaker,
  priorityZero,
];
