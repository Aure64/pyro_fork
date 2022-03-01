import { checkForDeactivations } from "./bakerMonitor";
import { checkHealth } from "./bakerMonitor";
import { setLevel } from "loglevel";
import { BakerBlockEvent, BakerEvent } from "./events";

setLevel("SILENT");

import { Delegate } from "rpc/types";

import { Events } from "./events";

Date.now = jest.fn(() => 1624758855227);

const createdAt = new Date(Date.now());

describe("checkForDeactivations", () => {
  const baseDelegateInfo: Delegate = {
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

  const threshold = 1;

  it("returns null for bakers in good standing", async () => {
    const cycle = 1000;
    const baker = "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1";
    const delegateInfo = {
      ...baseDelegateInfo,
    };
    const result = checkForDeactivations({
      baker,
      cycle,
      delegateInfo,
      threshold,
    });
    expect(result).toEqual(null);
  });

  it("returns an event for deactivated bakers", async () => {
    const cycle = 1000;
    const baker = "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1";
    const delegateInfo = {
      ...baseDelegateInfo,
      deactivated: true,
    };
    const result = checkForDeactivations({
      baker,
      cycle,
      delegateInfo,
      threshold,
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
    const delegateInfo = {
      ...baseDelegateInfo,
      grace_period: 1001,
    };
    const result = checkForDeactivations({
      baker,
      cycle,
      delegateInfo,
      threshold,
    });
    expect(result).toEqual({
      baker: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
      cycle: 1001,
      kind: Events.DeactivationRisk,
      createdAt,
    });
  });
});

describe("checkHealth", () => {
  const cycle = 1;
  const level = 1;
  const timestamp = new Date();
  const baker1 = "tz1AAAAAAAAAA";
  const missedEventsThreshold = 3;

  const mkEvent = (kind: Events, baker: string): BakerBlockEvent =>
    ({
      kind,
      createdAt,
      baker,
      cycle,
      level,
      timestamp,
    } as BakerBlockEvent);

  it("returns baker is unhealthy when there are more missed events than threshold", async () => {
    const missedCounts = new Map<string, number>([
      [baker1, missedEventsThreshold - 1],
    ]);

    for (const kind of [
      Events.MissedBake,
      Events.MissedEndorsement,
      Events.MissedBonus,
    ]) {
      const health = Array.from(
        checkHealth(
          [mkEvent(kind, baker1)],
          missedEventsThreshold,
          missedCounts
        )
      );

      expect(health.length).toEqual(1);
      expect(health[0].event).toEqual(Events.BakerUnhealthy);
      expect(health[0].baker).toEqual(baker1);
      expect(health[0].newCount).toEqual(3);
    }
  });

  it("returns no event for more missed bakes/endorsements above the threshold", async () => {
    const missedCounts = new Map<string, number>([
      [baker1, missedEventsThreshold],
    ]);

    for (const kind of [
      Events.MissedBake,
      Events.MissedEndorsement,
      Events.MissedBonus,
    ]) {
      const health = Array.from(
        checkHealth(
          [mkEvent(kind, baker1)],
          missedEventsThreshold,
          missedCounts
        )
      );

      expect(health.length).toEqual(1);
      expect(health[0].event).toEqual(undefined);
      expect(health[0].baker).toEqual(baker1);
      expect(health[0].newCount).toEqual(missedEventsThreshold + 1);
    }
  });

  it("returns baker recovered when there is a successfull bake or endorsement", async () => {
    const missedCounts = new Map<string, number>([
      [baker1, missedEventsThreshold + 1],
    ]);

    for (const kind of [Events.Baked, Events.Endorsed]) {
      const health = Array.from(
        checkHealth(
          [mkEvent(kind, baker1)],
          missedEventsThreshold,
          missedCounts
        )
      );

      expect(health.length).toEqual(1);
      expect(health[0].event).toEqual(Events.BakerRecovered);
      expect(health[0].baker).toEqual(baker1);
      expect(health[0].newCount).toEqual(0);
    }
  });
});
