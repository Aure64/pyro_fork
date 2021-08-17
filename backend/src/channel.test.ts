import * as fs from "fs";
import * as os from "os";
import { sep } from "path";

import { Event, Events } from "./events";
import * as eventlog from "./eventlog";
import * as channel from "./channel";

const mkTempDir = async (): Promise<string> => {
  const tmpDir = os.tmpdir();
  return await fs.promises.mkdtemp(
    `${tmpDir}${sep}pyrometer-storage-test`,
    "utf8"
  );
};

const mkEventLog = async (
  storageDir: string
): Promise<[eventlog.EventLog<Event>, Event[]]> => {
  const eventLog = await eventlog.open<Event>(storageDir);

  const ago = (minutes: number): Date =>
    new Date(Date.now() - minutes * 60 * 1e3);

  const item1: Event = {
    kind: Events.Baked,
    baker: "tz1abc",
    level: 1,
    createdAt: ago(7),
  };

  const item2: Event = {
    kind: Events.Endorsed,
    baker: "tz1abc",
    level: 2,
    createdAt: ago(5),
  };

  const item3: Event = {
    kind: Events.MissedEndorsement,
    baker: "tz1abc",
    level: 3,
    createdAt: ago(3),
  };

  await eventLog.add(item1);
  await eventLog.add(item2);
  await eventLog.add(item3);

  return [eventLog, [item1, item2, item3]];
};

describe("channel", () => {
  it("sends in batches", async () => {
    const storageDir = await mkTempDir();
    const [eventLog, [item1, item2, item3]] = await mkEventLog(storageDir);

    const batches: Event[][] = [];

    const maxBatchSize = 1;
    const interval = 0.1;
    const ttl = Number.MAX_SAFE_INTEGER;

    const chan = await channel.create(
      "test",
      async (events: Event[]) => {
        batches.push(events);
      },
      storageDir,
      eventLog,
      { maxBatchSize, ttl, interval }
    );

    setTimeout(() => chan.stop(), interval * 5e3);

    await chan.start();

    expect(batches).toEqual([[item1], [item2], [item3]]);
  });

  it("batch can be smaller than max", async () => {
    const storageDir = await mkTempDir();
    const [eventLog, [item1, item2, item3]] = await mkEventLog(storageDir);

    const batches: Event[][] = [];

    const maxBatchSize = 2;
    const interval = 0.1;
    const ttl = Number.MAX_SAFE_INTEGER;

    const chan = await channel.create(
      "test",
      async (events: Event[]) => {
        batches.push(events);
      },
      storageDir,
      eventLog,
      { maxBatchSize, ttl, interval }
    );

    setTimeout(() => chan.stop(), interval * 5e3);

    await chan.start();

    expect(batches).toEqual([[item1, item2], [item3]]);
  });

  it("discards old messages", async () => {
    const storageDir = await mkTempDir();
    const [eventLog, [_item1, _item2, item3]] = await mkEventLog(storageDir);

    const batches: Event[][] = [];

    const maxBatchSize = 50;
    const interval = 0.1;
    const ttl = 4 * 60;

    const chan = await channel.create(
      "test",
      async (events: Event[]) => {
        batches.push(events);
      },
      storageDir,
      eventLog,
      { maxBatchSize, ttl, interval }
    );

    setTimeout(() => chan.stop(), interval * 5e3);

    await chan.start();

    expect(batches).toEqual([[item3]]);
  });

  it("retries", async () => {
    const storageDir = await mkTempDir();
    const [eventLog, [item1, item2, item3]] = await mkEventLog(storageDir);

    const batches: Event[][] = [];

    const maxBatchSize = 3;
    const interval = 0.1;
    const ttl = Number.MAX_SAFE_INTEGER;

    let attempt = 0;

    const chan = await channel.create(
      "test",
      async (events: Event[]) => {
        attempt += 1;
        if (attempt === 1) throw new Error("simulated error");
        batches.push(events);
      },
      storageDir,
      eventLog,
      { maxBatchSize, ttl, interval }
    );

    setTimeout(() => chan.stop(), interval * 5e3);

    await chan.start();

    expect(batches).toEqual([[item1, item2, item3]]);
  });
});
