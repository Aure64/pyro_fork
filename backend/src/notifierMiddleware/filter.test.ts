import { shouldNotify } from "./filter";

describe("shouldNotify", () => {
  it("rejects notification events for the same channel", () => {
    const result = shouldNotify(
      {
        channelName: "desktop",
        history: { nextEndorseLevel: 1000, nextBakeLevel: 1000 },
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
});
