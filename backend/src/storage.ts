import * as fs from "fs";
import * as path from "path";
import { getLogger } from "loglevel";

import { writeJson, readJson } from "./fs-utils";
import { normalize, join } from "path";

export type Key = string | number;

export type Storage = {
  put: (key: Key, value: any) => Promise<void>;
  get: (key: Key, defaultValue?: any) => Promise<any>;
  remove: (key: Key) => Promise<any>;
  keys: () => Promise<string[]>;
};

export const open = async (
  storagePath: string | string[]
): Promise<Storage> => {
  const log = getLogger("storage");

  const storageDir = normalize(
    Array.isArray(storagePath) ? join(...storagePath) : storagePath
  );
  log.debug(`Storage path: ${storageDir}`);

  await fs.promises.mkdir(storageDir, { recursive: true });

  const stats = await fs.promises.stat(storageDir);
  if (!stats.isDirectory()) {
    throw Error(`${storageDir} must be a directory`);
  }

  const mkFullPath = (key: Key) => path.join(storageDir, key.toString());

  const put = async (key: Key, value: any) => {
    await writeJson(mkFullPath(key), value);
  };

  const get = async (key: Key, defaultValue: any = null) => {
    const fileName = mkFullPath(key);
    try {
      return await readJson(fileName);
    } catch (err) {
      log.debug(`Could not read ${fileName}`, err);
      return defaultValue;
    }
  };

  const keys = async (): Promise<string[]> => {
    return await fs.promises.readdir(storageDir);
  };

  const remove = async (key: Key) => {
    await fs.promises.unlink(mkFullPath(key));
  };

  return { put, get, remove, keys };
};
