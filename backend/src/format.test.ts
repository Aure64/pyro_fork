import { shuffle } from "lodash";

import { BakerEvent, Events } from "./events";
import * as format from "./format";

describe("format", () => {
  const baker1 = `tz1irJKkXS2DBWkU1NnmFQx1c1L7pbGg4yhk`;
  const baker2 = `tz3NExpXn9aPNZPorRE4SdjJ2RGrfbJgMAaV`;
  const baker3 = `tz3RDC3Jdn4j15J7bBHZd29EUee9gVB1CxD9`;
  const baker4 = `tz2TSvNTh2epDMhZHrw73nV9piBX7kLZ9K9m`;
  const baker5 = `tz2Q7Km98GPzV1JLNpkrQrSo5YUhPfDp6LmA`;

  const createdAt = new Date("2021-06-20");
  const level = 10000;
  const cycle = 1;
  const timestamp = new Date();
  const priority = 0;
  const slotCount = 1;

  const events: BakerEvent[] = [
    {
      kind: Events.Baked,
      baker: baker1,
      level: level + 1,
      createdAt,
      cycle,
      timestamp,
      priority,
    },

    {
      kind: Events.Endorsed,
      baker: baker1,
      level: level + 2,
      createdAt,
      cycle,
      timestamp,
      slotCount,
    },

    {
      kind: Events.MissedEndorsement,
      baker: baker1,
      level: level + 3,
      createdAt,
      cycle,
      timestamp,
      slotCount,
    },

    {
      kind: Events.Baked,
      baker: baker1,
      level: level + 4,
      createdAt,
      cycle,
      timestamp,
      priority,
    },

    {
      kind: Events.Endorsed,
      baker: baker1,
      level: level + 5,
      createdAt,
      cycle,
      timestamp,
      slotCount,
    },

    {
      kind: Events.Baked,
      baker: baker2,
      level: level + 6,
      createdAt,
      cycle,
      timestamp,
      priority,
    },

    {
      kind: Events.Endorsed,
      baker: baker2,
      level: level + 7,
      createdAt,
      cycle,
      timestamp,
      slotCount,
    },

    {
      kind: Events.MissedEndorsement,
      baker: baker2,
      level: level + 8,
      createdAt,
      cycle,
      timestamp,
      slotCount,
    },

    {
      kind: Events.Endorsed,
      baker: baker2,
      level: level + 9,
      createdAt,
      cycle,
      timestamp,
      slotCount,
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
      [
        "tz1irJKkXS2DBWkU1NnmFQx1c1L7pbGg4yhk baked @1000[1-4]²",
        "                                   . endorsed @1000[2-5]²",
        "                                   . missed endorsement @10003",
        "tz3NExpXn9aPNZPorRE4SdjJ2RGrfbJgMAaV baked @10006",
        "                                   . endorsed @1000[7-9]²",
        "                                   . missed endorsement @10008",
        "tz3RDC3Jdn4j15J7bBHZd29EUee9gVB1CxD9 deactivated @cycle 13",
        "tz2TSvNTh2epDMhZHrw73nV9piBX7kLZ9K9m deactivated @cycle 15",
        "tz2Q7Km98GPzV1JLNpkrQrSo5YUhPfDp6LmA deactivated @cycle 17",
      ]
    `);
  });

  it("no more than one event of each kind", async () => {
    expect(format.aggregateByBaker(events.slice(0, 3))).toMatchInlineSnapshot(`
      [
        "tz1irJKkXS2DBWkU1NnmFQx1c1L7pbGg4yhk baked @10001",
        "                                   . endorsed @10002",
        "                                   . missed endorsement @10003",
      ]
    `);
  });

  it("multiple events of same kind (emoji)", async () => {
    expect(format.aggregateByBaker(events, true)).toMatchInlineSnapshot(`
      [
        "tz1irJKkXS2DBWkU1NnmFQx1c1L7pbGg4yhk 🥖 @1000[1-4]²",
        "                                   . 👍 @1000[2-5]²",
        "                                   . 😕 @10003",
        "tz3NExpXn9aPNZPorRE4SdjJ2RGrfbJgMAaV 🥖 @10006",
        "                                   . 👍 @1000[7-9]²",
        "                                   . 😕 @10008",
        "tz3RDC3Jdn4j15J7bBHZd29EUee9gVB1CxD9 😴 @cycle 13",
        "tz2TSvNTh2epDMhZHrw73nV9piBX7kLZ9K9m 😴 @cycle 15",
        "tz2Q7Km98GPzV1JLNpkrQrSo5YUhPfDp6LmA 😴 @cycle 17",
      ]
    `);
  });

  it("can abbreviate baker address", async () => {
    expect(format.aggregateByBaker(events, true, true)).toMatchInlineSnapshot(`
      [
        "tz1i…4yhk 🥖 @1000[1-4]²",
        "        . 👍 @1000[2-5]²",
        "        . 😕 @10003",
        "tz3N…MAaV 🥖 @10006",
        "        . 👍 @1000[7-9]²",
        "        . 😕 @10008",
        "tz3R…CxD9 😴 @cycle 13",
        "tz2T…9K9m 😴 @cycle 15",
        "tz2Q…6LmA 😴 @cycle 17",
      ]
    `);
  });

  it("no more than one event of each kind (emoji)", async () => {
    expect(format.aggregateByBaker(events.slice(0, 3), true))
      .toMatchInlineSnapshot(`
      [
        "tz1irJKkXS2DBWkU1NnmFQx1c1L7pbGg4yhk 🥖 @10001",
        "                                   . 👍 @10002",
        "                                   . 😕 @10003",
      ]
    `);
  });

  it("just email subject if one line", async () => {
    const [subject, text] = format.email(events.slice(0, 5), true);
    expect(subject).toMatchInlineSnapshot(
      `"tz1irJKkXS2DBWkU1NnmFQx1c1L7pbGg4yhk 🥖 @1000[1-4]² 👍 @1000[2-5]² 😕 @10003"`
    );
    expect(text).toBe("");
  });

  it("summary in email subject if multiple lines", async () => {
    const [subject, text] = format.email(events, true);
    expect(subject).toMatchInlineSnapshot(`"🥖 3 👍 4 😕 2 😴 3 @1000[1-9]"`);
    expect(text).toMatchInlineSnapshot(`
      "tz1irJKkXS2DBWkU1NnmFQx1c1L7pbGg4yhk 🥖 @1000[1-4]² 👍 @1000[2-5]² 😕 @10003
      tz3NExpXn9aPNZPorRE4SdjJ2RGrfbJgMAaV 🥖 @10006 👍 @1000[7-9]² 😕 @10008
      tz3RDC3Jdn4j15J7bBHZd29EUee9gVB1CxD9 😴 @cycle 13
      tz2TSvNTh2epDMhZHrw73nV9piBX7kLZ9K9m 😴 @cycle 15
      tz2Q7Km98GPzV1JLNpkrQrSo5YUhPfDp6LmA 😴 @cycle 17"
    `);
  });

  it("order of events in summary is fixed", async () => {
    const events1 = events;
    const events2 = shuffle(events);
    const events3 = shuffle(events);

    expect(events1).not.toEqual(events2);
    expect(events2).not.toEqual(events3);

    const [subject1, _text1] = format.email(events1, true);
    const [subject2, _text2] = format.email(events2, true);
    const [subject3, _text3] = format.email(events3, true);

    expect(subject1).toEqual(subject2);
    expect(subject2).toEqual(subject3);
  });
});

describe("range", () => {
  it("empty string if no start and no end", async () => {
    expect(format.formatRange(undefined, undefined)).toEqual("");
  });

  it("one level if only start or end or start and end are same", async () => {
    const level = 12345;
    expect(format.formatRange(level, undefined)).toEqual(`${level}`);
    expect(format.formatRange(undefined, level)).toEqual(`${level}`);
    expect(format.formatRange(level, level)).toEqual(`${level}`);
  });

  it("formatted with delimiter if distinct start and end", async () => {
    expect(format.formatRange(123, 456)).toEqual("[123-456]");
  });

  it("recognizes common prefix in start and end", async () => {
    expect(format.formatRange(123456, 123789)).toEqual("123[456-789]");
  });
});
