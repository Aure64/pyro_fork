import { shouldNotify, updateHistory } from "./filter";
import { TezosNodeEvent } from "../types";

describe("shouldNotify", () => {
  it("rejects notification events for the same channel", () => {
    const result = shouldNotify(
      {
        channelName: "desktop",
        history: { nextEndorseLevel: 1000, nextBakeLevel: 1000 },
        excludedEvents: [],
      },
      { type: "NOTIFIER", message: "some error", channelName: "desktop" }
    );
    expect(result).toEqual(false);
  });

  it("rejects baking events for lower levels", () => {
    const result = shouldNotify(
      {
        channelName: "desktop",
        history: { nextEndorseLevel: 1000, nextBakeLevel: 1000 },
        excludedEvents: [],
      },
      {
        type: "BAKER",
        kind: "FUTURE_BAKING_OPPORTUNITY",
        message: "some error",
        level: 900,
        baker: "some baker",
        date: new Date(),
      }
    );
    expect(result).toEqual(false);
  });

  it("rejects endorsing events for lower levels", () => {
    const result = shouldNotify(
      {
        channelName: "desktop",
        history: { nextEndorseLevel: 1000, nextBakeLevel: 1000 },
        excludedEvents: [],
      },
      {
        type: "BAKER",
        kind: "FUTURE_BAKING_OPPORTUNITY",
        message: "some error",
        level: 900,
        baker: "some baker",
        date: new Date(),
      }
    );
    expect(result).toEqual(false);
  });

  it("rejects endorsing events for lower levels", () => {
    const result = shouldNotify(
      {
        channelName: "desktop",
        history: { nextEndorseLevel: 1000, nextBakeLevel: 1000 },
        excludedEvents: [],
      },
      {
        type: "BAKER",
        kind: "FUTURE_ENDORSING_OPPORTUNITY",
        message: "some error",
        level: 900,
        baker: "some baker",
        date: new Date(),
      }
    );
    expect(result).toEqual(false);
  });

  it("accepts baking events for higher levels", () => {
    const result = shouldNotify(
      {
        channelName: "desktop",
        history: { nextEndorseLevel: 1000, nextBakeLevel: 1000 },
        excludedEvents: [],
      },
      {
        type: "BAKER",
        kind: "FUTURE_BAKING_OPPORTUNITY",
        message: "some error",
        level: 1100,
        baker: "some baker",
        date: new Date(),
      }
    );
    expect(result).toEqual(true);
  });

  it("accepts endorsing events for higher levels", () => {
    const result = shouldNotify(
      {
        channelName: "desktop",
        history: { nextEndorseLevel: 1000, nextBakeLevel: 1000 },
        excludedEvents: [],
      },
      {
        type: "BAKER",
        kind: "FUTURE_ENDORSING_OPPORTUNITY",
        message: "some error",
        level: 1100,
        baker: "some baker",
        date: new Date(),
      }
    );
    expect(result).toEqual(true);
  });

  it("rejects baking events for excluded event types", () => {
    const result = shouldNotify(
      {
        channelName: "desktop",
        history: { nextEndorseLevel: 0, nextBakeLevel: 0 },
        excludedEvents: ["FUTURE_BAKING_OPPORTUNITY"],
      },
      {
        type: "BAKER",
        kind: "FUTURE_BAKING_OPPORTUNITY",
        message: "some error",
        level: 900,
        baker: "some baker",
        date: new Date(),
      }
    );
    expect(result).toEqual(false);
  });
});

describe("updateHistory", () => {
  it("updates nextBakeLevel to higher level", () => {
    const history = { nextBakeLevel: 1000, nextEndorseLevel: 1000 };
    const bakeEvent: TezosNodeEvent = {
      type: "BAKER",
      kind: "FUTURE_BAKING_OPPORTUNITY",
      message: "some error",
      level: 1100,
      baker: "some baker",
      date: new Date(),
    };
    const result = updateHistory(history, bakeEvent);

    expect(result).toEqual({ nextBakeLevel: 1100, nextEndorseLevel: 1000 });
  });

  it("updates nextEndorseLevel to higher level", () => {
    const history = { nextBakeLevel: 1000, nextEndorseLevel: 1000 };
    const bakeEvent: TezosNodeEvent = {
      type: "BAKER",
      kind: "FUTURE_ENDORSING_OPPORTUNITY",
      message: "some error",
      level: 1100,
      baker: "some baker",
      date: new Date(),
    };
    const result = updateHistory(history, bakeEvent);

    expect(result).toEqual({ nextBakeLevel: 1000, nextEndorseLevel: 1100 });
  });

  it("doesn't update nextBakeLevel to lower level", () => {
    const history = { nextBakeLevel: 1000, nextEndorseLevel: 1000 };
    const bakeEvent: TezosNodeEvent = {
      type: "BAKER",
      kind: "FUTURE_BAKING_OPPORTUNITY",
      message: "some error",
      level: 900,
      baker: "some baker",
      date: new Date(),
    };
    const result = updateHistory(history, bakeEvent);

    expect(result).toEqual({ nextBakeLevel: 1000, nextEndorseLevel: 1000 });
  });

  it("doesn't update nextEndorseLevel to lower level", () => {
    const history = { nextBakeLevel: 1000, nextEndorseLevel: 1000 };
    const bakeEvent: TezosNodeEvent = {
      type: "BAKER",
      kind: "FUTURE_ENDORSING_OPPORTUNITY",
      message: "some error",
      level: 900,
      baker: "some baker",
      date: new Date(),
    };
    const result = updateHistory(history, bakeEvent);

    expect(result).toEqual({ nextBakeLevel: 1000, nextEndorseLevel: 1000 });
  });
});
