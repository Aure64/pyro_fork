import * as fs from "fs";
import * as os from "os";
import { sep } from "path";

import * as storage from "./storage";

const mkTempStorage = async (): Promise<storage.Storage> => {
  const tmpDir = os.tmpdir();
  const dir = await fs.promises.mkdtemp(
    `${tmpDir}${sep}pyrometer-storage-test`,
    "utf8"
  );
  return await storage.open(dir);
};

describe("storage", () => {
  it("stores and retrieves items", async () => {
    const store = await mkTempStorage();

    expect(await store.keys()).toEqual([]);

    const item1 = { a: 1, b: new Date(1624845623) };
    const item2 = 42;
    const item3 = "hello";

    await store.put("a", item1);
    await store.put("b", item2);
    await store.put("c", item3);

    expect(await store.keys()).toEqual(["a", "b", "c"]);
    expect(await store.get("c")).toEqual(item3);
    expect(await store.get("b")).toEqual(item2);
    expect(await store.get("a")).toEqual(item1);
  });

  it("can delete items", async () => {
    const store = await mkTempStorage();
    const item1 = { a: 1 };
    await store.put("a", item1);
    expect(await store.keys()).toEqual(["a"]);
    await store.remove("a");
    expect(await store.keys()).toEqual([]);
  });

  it("returns null for non-existing keys", async () => {
    const store = await mkTempStorage();
    expect(await store.get("abc")).toEqual(null);
  });
});
