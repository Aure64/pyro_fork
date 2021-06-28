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
  it("appends and reads items", async () => {
    const elog = await eventlog.open<any>(await mkTempDir());

    const item1 = { a: 1 };
    const item2 = { b: 2 };
    const item3 = { c: 3 };

    const entry1 = await elog.add(item1);
    const entry2 = await elog.add(item2);
    const entry3 = await elog.add(item3);

    const batch: eventlog.LogEntry<any>[] = [];
    for await (const record of elog.readAfter(-1)) {
      batch.push(record);
    }

    expect(batch).toEqual([entry1, entry2, entry3]);
  });

  it("deletes items", async () => {
    const elog = await eventlog.open(await mkTempDir());

    const item1 = { a: 1 };
    const item2 = { b: 2 };
    const item3 = { c: 3 };

    await elog.add(item1);
    await elog.add(item2);
    const lastEntry = await elog.add(item3);

    await elog.deleteUpTo(lastEntry.position - 1);

    const batch: eventlog.LogEntry<any>[] = [];
    for await (const record of elog.readAfter(-1)) {
      batch.push(record);
    }

    expect(batch).toEqual([lastEntry]);
  });
});
