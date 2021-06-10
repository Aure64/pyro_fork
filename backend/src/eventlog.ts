import * as fs from "fs";
import { debug } from "loglevel";

import { writeJson, readJson, ensureExists } from "./fs-utils";

export type LogEntry = {
  value: any;
  position: number;
  timestamp: Date;
};

export type EventLog = {
  add: (event: any) => Promise<LogEntry>;
  readAfter: (position: number) => AsyncIterableIterator<LogEntry>;
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

  const add = async (event: any): Promise<LogEntry> => {
    const eventPos = sequence;
    await writeJson(mkEventFileName(eventsDir, eventPos), event);
    const nextSequenceValue = sequence + 1;
    await writeSeq(nextSequenceValue);
    sequence = nextSequenceValue;
    return { value: event, position: eventPos, timestamp: new Date() };
  };

  const read = async (position: number): Promise<any> => {
    const fileName = mkEventFileName(eventsDir, position);
    try {
      const value = await readJson(fileName);
      const timestamp = (await fs.promises.stat(fileName)).ctime;
      return { value, timestamp, position };
    } catch (err) {
      debug(`Could not read ${fileName}`, err);
      return null;
    }
  };

  const readAfter = async function* (
    position: number
  ): AsyncIterableIterator<any> {
    let currentPosition = position + 1;
    while (currentPosition < sequence) {
      const record = await read(currentPosition);
      if (record) {
        yield record;
      }
      currentPosition++;
    }
  };

  return {
    add,
    readAfter,
  };
};
