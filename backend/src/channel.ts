import { TezosNodeEvent, Sender } from "./types";
import { getLogger } from "loglevel";
import { EventLog, EventLogConsumer } from "./eventlog";

import { normalize } from "path";

import { writeJson, readJson, ensureExists } from "./fs-utils";
import * as service from "./service";

export type Channel = service.Service & EventLogConsumer;

export const createChannel = async (
  name: string,
  send: Sender,
  storageDirectory: string,
  eventLog: EventLog
): Promise<Channel> => {
  const log = getLogger(name);

  const path = normalize(`${storageDirectory}/consumers/${name}`);

  const readPosition = async () => (await readJson(path)) as number;
  const writePosition = async (value: number) => await writeJson(path, value);

  await ensureExists(path, 0);

  const task = async () => {
    const batch: TezosNodeEvent[] = [];
    let position = await readPosition();
    log.debug(`reading from position ${position}`);
    for await (const record of eventLog.readAfter(position)) {
      batch.push(record.value);
      position = record.position;
    }
    log.debug(`read batch of ${batch.length}, last position ${position}`);
    if (batch.length > 0) {
      try {
        await send(batch);
        await writePosition(position);
      } catch (err) {
        log.error(`could not send`, err);
      }
    }
  };

  const srv = service.create(name, task, 60 * 1e3);

  return {
    name,
    start: srv.start,
    stop: srv.stop,
    position: readPosition,
  };
};
