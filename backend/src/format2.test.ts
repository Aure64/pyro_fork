import { BakerEvent, Kind as Events } from "./types2";
import * as format from "./format2";

describe("format", () => {
  const baker1 = `tz1irJKkXS2DBWkU1NnmFQx1c1L7pbGg4yhk`;
  const baker2 = `tz3NExpXn9aPNZPorRE4SdjJ2RGrfbJgMAaV`;
  const baker3 = `tz3RDC3Jdn4j15J7bBHZd29EUee9gVB1CxD9`;
  const baker4 = `tz2TSvNTh2epDMhZHrw73nV9piBX7kLZ9K9m`;
  const baker5 = `tz2Q7Km98GPzV1JLNpkrQrSo5YUhPfDp6LmA`;

  const createdAt = new Date("2021-06-20");
  const level = 10000;

  const events: BakerEvent[] = [
    {
      kind: Events.Baked,
      baker: baker1,
      level: level + 1,
      createdAt,
    },

    {
      kind: Events.Endorsed,
      baker: baker1,
      level: level + 2,
      createdAt,
    },

    {
      kind: Events.MissedEndorsement,
      baker: baker1,
      level: level + 3,
      createdAt,
    },

    {
      kind: Events.Baked,
      baker: baker1,
      level: level + 4,
      createdAt,
    },

    {
      kind: Events.Endorsed,
      baker: baker1,
      level: level + 5,
      createdAt,
    },

    {
      kind: Events.Baked,
      baker: baker2,
      level: level + 6,
      createdAt,
    },

    {
      kind: Events.Endorsed,
      baker: baker2,
      level: level + 7,
      createdAt,
    },

    {
      kind: Events.MissedEndorsement,
      baker: baker2,
      level: level + 8,
      createdAt,
    },

    {
      kind: Events.Endorsed,
      baker: baker2,
      level: level + 9,
      createdAt,
    },

    {
      kind: Events.Deactivated,
      baker: baker3,
      cycle: 13,
      createdAt,
    },

    {
      kind: Events.Deactivated,
      baker: baker4,
      cycle: 15,
      createdAt,
    },

    {
      kind: Events.Deactivated,
      baker: baker5,
      cycle: 17,
      createdAt,
    },
  ];

  it("multiple events of same kind", async () => {
    expect(format.aggregateByBaker(events)).toMatchInlineSnapshot(`
      Array [
        "tz1irJKkXS2DBWkU1NnmFQx1c1L7pbGg4yhk: baked 2 @ 10001-10004, endorsed 2 @ 10002-10005, missed endorsement @ 10003",
        "tz3NExpXn9aPNZPorRE4SdjJ2RGrfbJgMAaV: baked @ 10006, endorsed 2 @ 10007-10009, missed endorsement @ 10008",
      ]
    `);
  });

  it("no more than one event of each kind", async () => {
    expect(format.aggregateByBaker(events.slice(0, 3))).toMatchInlineSnapshot(`
      Array [
        "tz1irJKkXS2DBWkU1NnmFQx1c1L7pbGg4yhk: baked @ 10001, endorsed @ 10002, missed endorsement @ 10003",
      ]
    `);
  });

  it("multiple events of same kind (emoji)", async () => {
    expect(format.aggregateByBaker(events, true)).toMatchInlineSnapshot(`
      Array [
        "tz1irJKkXS2DBWkU1NnmFQx1c1L7pbGg4yhk: 🥖 2 @ 10001-10004, 👍 2 @ 10002-10005, 😕 @ 10003",
        "tz3NExpXn9aPNZPorRE4SdjJ2RGrfbJgMAaV: 🥖 @ 10006, 👍 2 @ 10007-10009, 😕 @ 10008",
      ]
    `);
  });

  it("no more than one event of each kind (emoji)", async () => {
    expect(format.aggregateByBaker(events.slice(0, 3), true))
      .toMatchInlineSnapshot(`
      Array [
        "tz1irJKkXS2DBWkU1NnmFQx1c1L7pbGg4yhk: 🥖 @ 10001, 👍 @ 10002, 😕 @ 10003",
      ]
    `);
  });
});
