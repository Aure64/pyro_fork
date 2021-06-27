import { Event, Sender } from "./types2";
import { getLogger } from "loglevel";
import { EventLog, EventLogConsumer } from "./eventlog";

import * as service from "./service";
import * as storage from "./storage";

export type Channel = service.Service & EventLogConsumer;

export const create = async (
  name: string,
  send: Sender,
  storageDirectory: string,
  eventLog: EventLog
): Promise<Channel> => {
  const log = getLogger(name);

  const store = await storage.open([storageDirectory, "consumers"]);

  const readPosition = async () => (await store.get(name, 0)) as number;
  const writePosition = async (value: number) => await store.put(name, value);

  const task = async () => {
    const batch: Event[] = [];
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
