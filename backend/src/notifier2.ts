import { TezosNodeEvent, Sender } from "./types";
import { debug, info, error } from "loglevel";
import { EventLog, EventLogConsumer } from "./eventlog";

import { normalize } from "path";

import { writeJson, readJson, ensureExists } from "./fs-utils";
import * as service from "./service";

export type Channel = service.Service & EventLogConsumer;

export const createChannel = (
  name: string,
  send: Sender,
  storageDirectory: string,
  eventLog: EventLog
): Channel => {
  const path = normalize(`${storageDirectory}/consumers/${name}`);

  const readPosition = async () => (await readJson(path)) as number;
  const writePosition = async (value: number) => await writeJson(path, value);

  const init = async () => await ensureExists(path, 0);

  const task = async () => {
    const batch: TezosNodeEvent[] = [];
    let position = await readPosition();
    debug(`[${name}] reading from position ${position}`);
    for await (const record of eventLog.readAfter(position)) {
      batch.push(record.value);
      position = record.position;
    }
    debug(`[${name}] Read batch of ${batch.length}, last position ${position}`);
    if (batch.length > 0) {
      try {
        await send(batch);
        await writePosition(position);
      } catch (err) {
        error(`[${name}] could not send`, err);
      }
    }
  };

  const srv = service.create(name, task, 60 * 1e3, init);

  return {
    name,
    start: srv.start,
    stop: srv.stop,
    position: readPosition,
  };
};
