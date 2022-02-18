import { checkForDeactivations } from "./bakerMonitor";
import { setLevel } from "loglevel";

setLevel("SILENT");

import { Delegate } from "rpc/types";

import { Events } from "./events";

Date.now = jest.fn(() => 1624758855227);

const createdAt = new Date(Date.now());

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
