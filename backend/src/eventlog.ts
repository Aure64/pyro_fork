import * as fs from "fs";
import { debug } from "loglevel";

import { writeJson, readJson, ensureExists } from "./fs-utils";

export type EventLog = {
  add: (event: any) => Promise<void>;
  get: (eventId: number) => Promise<any>;
};

const mkParentDirName = (path: string) => `${path}/eventlog`;
const mkEventsDirName = (path: string) => `${mkParentDirName(path)}/events`;
const mkSequenceFileName = (path: string) =>
  `${mkParentDirName(path)}/sequence`;
const mkEventFileName = (path: string, offset: number) =>
  `${path}/${offset}.json`;

export const open = async (path: string): Promise<EventLog> => {
  const eventsDir = mkEventsDirName(path);
  const sequenceFileName = mkSequenceFileName(path);

  await fs.promises.mkdir(eventsDir, { recursive: true });

  const stats = await fs.promises.stat(path);
  if (!stats.isDirectory()) {
    throw Error(`${path} must be a directory`);
  }

  const writeSeq = async (value: number) =>
    await writeJson(sequenceFileName, value);

  ensureExists(sequenceFileName, 0);

  let sequence = (await readJson(sequenceFileName)) as number;

  const add = async (event: any): Promise<void> => {
    await writeJson(mkEventFileName(eventsDir, sequence), event);
    await writeSeq(sequence + 1);
    sequence++;
  };

  const get = async (eventOffset: number): Promise<any> => {
    const fileName = mkEventFileName(eventsDir, eventOffset);
    try {
      return await readJson(fileName);
    } catch (err) {
      debug(`Could not read ${fileName}`, err);
      return null;
    }
  };

  return {
    add,
    get,
  };
};
