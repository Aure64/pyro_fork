import { checkForDeactivations } from "./bakerMonitor";
import { setLevel } from "loglevel";

setLevel("SILENT");

import { Delegate } from "rpc/types";
// import { RpcClient } from "rpc/client";

import { Events } from "./events";

Date.now = jest.fn(() => 1624758855227);

const createdAt = new Date(Date.now());

// describe("loadBlockRights", () => {
//   it("fetches baking and endorsing rights", async () => {
//     const getBakingRights = jest.fn().mockResolvedValue({});
//     const getEndorsingRights = jest.fn().mockResolvedValue({});
//     const rpc = {
//       getBakingRights,
//       getEndorsingRights,
//     } as unknown as RpcClient;

//     await loadBlockRights("some_hash", 123, 0, rpc);

//     expect(getBakingRights.mock.calls.length).toEqual(1);
//     expect(getEndorsingRights.mock.calls.length).toEqual(1);
//   });

//   it("throws error for failed block data fetch", async () => {
//     const getBakingRights = jest.fn().mockResolvedValue({});
//     const getEndorsingRights = jest.fn().mockRejectedValue(new Error());
//     const rpc = {
//       getBakingRights,
//       getEndorsingRights,
//     } as unknown as RpcClient;

//     const blockId = "some_hash";

//     await expect(loadBlockRights(blockId, 123, 0, rpc)).rejects.toThrow();
//   });
// });

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
