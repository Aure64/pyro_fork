import {
  Events,
  Event,
  Notification,
  Baked,
  NodeSynced,
  FilteredSender,
} from "./events";

describe("filtered sender", () => {
  const event1: Notification = {
    kind: Events.Notification,
    createdAt: new Date(),
    message: "hi",
  };

  const event2: Baked = {
    kind: Events.Baked,
    createdAt: new Date(),
    baker: "tz123",
    cycle: 1,
    level: 1,
    priority: 0,
    timestamp: new Date(),
  };

  const event3: Baked = {
    kind: Events.Baked,
    createdAt: new Date(),
    baker: "tz345",
    cycle: 2,
    level: 2,
    priority: 0,
    timestamp: new Date(),
  };

  const event4: NodeSynced = {
    kind: Events.NodeSynced,
    createdAt: new Date(),
    node: "http://localhost:8732",
  };

  it("sends all when no exclude", async () => {
    const toSend = [event1, event2, event3, event4];
    let sent: Event[] = [];

    const sender = FilteredSender(
      async (inEvents: Event[]) => {
        sent = inEvents;
      },
      {
        exclude: [],
      }
    );

    await sender(toSend);

    expect(sent).toEqual(toSend);
  });

  it("filters excluded event kinds", async () => {
    const toSend = [event1, event2, event3, event4];
    let sent: Event[] = [];

    const sender = FilteredSender(
      async (inEvents: Event[]) => {
        sent = inEvents;
      },
      {
        exclude: [Events.Baked],
      }
    );

    await sender(toSend);

    expect(sent).toEqual([event1, event4]);
  });

  it("sends nothing when all kinds are excluded", async () => {
    const toSend = [event1, event2, event3, event4];
    let sent: Event[] = [];

    const sender = FilteredSender(
      async (inEvents: Event[]) => {
        sent = inEvents;
      },
      {
        exclude: Object.values(Events),
      }
    );

    await sender(toSend);

    expect(sent).toEqual([]);
  });
});
