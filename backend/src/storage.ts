import * as fs from "fs";
import * as path from "path";
import { getLogger } from "loglevel";

import { writeJson, readJson } from "./fs-utils";
import { normalize, join } from "path";

export type Key = string | number;

export type Storage = {
  put: (key: Key, value: unknown) => Promise<void>;
  get: (key: Key, defaultValue?: unknown) => Promise<unknown>;
  remove: (key: Key) => Promise<unknown>;
  keys: () => Promise<string[]>;
};

const TMP_POSTFIX = ".tmp";

const isNotTmp = (fileName: string) => !fileName.endsWith(TMP_POSTFIX);

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
  const mkTmpPath = (key: Key) => path.join(storageDir, `${key}${TMP_POSTFIX}`);

  const put = async (key: Key, value: unknown) => {
    const tmp = mkTmpPath(key);
    const fileName = mkFullPath(key);
    await writeJson(tmp, value);
    await fs.promises.rename(tmp, fileName);
  };

  const get = async (key: Key, defaultValue: unknown = null) => {
    const fileName = mkFullPath(key);
    try {
      return await readJson(fileName);
    } catch (err) {
      log.debug(`Could not read ${fileName}`, err);
      return defaultValue;
    }
  };

  const keys = async (): Promise<string[]> => {
    return (await fs.promises.readdir(storageDir)).filter(isNotTmp);
  };

  const remove = async (key: Key) => {
    await fs.promises.unlink(mkFullPath(key));
  };

  return { put, get, remove, keys };
};
