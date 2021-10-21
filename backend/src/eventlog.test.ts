import * as fs from "fs";
import * as os from "os";
import { sep } from "path";

import * as eventlog from "./eventlog";

const mkTempDir = async (): Promise<string> => {
  const tmpDir = os.tmpdir();
  return await fs.promises.mkdtemp(
    `${tmpDir}${sep}pyrometer-storage-test`,
    "utf8"
  );
};

describe("eventlog", () => {
  type T = Record<string, number>;
  const item1 = { a: 1 };
  const item2 = { b: 2 };
  const item3 = { c: 3 };
  const item4 = { c: 4 };

  it("appends and reads items", async () => {
    const elog = await eventlog.open<T>(await mkTempDir());

    const entry1 = await elog.add(item1);
    const entry2 = await elog.add(item2);
    const entry3 = await elog.add(item3);

    const batch: eventlog.LogEntry<T>[] = [];
    for await (const record of elog.readFrom(0)) {
      batch.push(record);
    }

    expect(batch).toEqual([entry1, entry2, entry3]);

    const batch2: eventlog.LogEntry<T>[] = [];
    for await (const record of elog.readFrom(-2)) {
      batch2.push(record);
    }

    expect(batch2).toEqual([entry2, entry3]);
  });

  it("doesn't exceed max size", async () => {
    const elog = await eventlog.open<T>(await mkTempDir(), "testlog", 3);

    await elog.add(item1);
    const entry2 = await elog.add(item2);
    const entry3 = await elog.add(item3);
    const entry4 = await elog.add(item4);

    const batch: eventlog.LogEntry<T>[] = [];
    for await (const record of elog.readFrom(0)) {
      batch.push(record);
    }

    expect(batch).toEqual([entry2, entry3, entry4]);
  });

  it("deletes items", async () => {
    const elog = await eventlog.open<T>(await mkTempDir());

    await elog.add(item1);
    await elog.add(item2);
    const lastEntry = await elog.add(item3);

    await elog.deleteUpTo(lastEntry.position - 1);

    const batch: eventlog.LogEntry<T>[] = [];
    for await (const record of elog.readFrom(0)) {
      batch.push(record);
    }

    expect(batch).toEqual([lastEntry]);
  });
});
