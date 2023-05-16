import { Event, Sender } from "./events";
import { getLogger } from "loglevel";
import { EventLog, EventLogConsumer } from "./eventlog";

import * as service from "./service";
import * as storage from "./storage";

export type Channel = service.Service & EventLogConsumer;

export type Seconds = number;

export type NotificationsConfig = {
  max_batch_size: number;
  ttl: Seconds;
  interval: Seconds;
};

export const create = async (
  name: string,
  send: Sender,
  storageDirectory: string,
  eventLog: EventLog<Event>,
  { max_batch_size: maxBatchSize, ttl, interval }: NotificationsConfig
): Promise<Channel> => {
  const log = getLogger(name);

  const store = await storage.open([storageDirectory, "consumers"]);

  const readPosition = async () => (await store.get(name, -1)) as number;
  const writePosition = async (value: number) => await store.put(name, value);

  const task = async () => {
    const batch: Event[] = [];
    let position = await readPosition();
    log.debug(`reading from position ${position}`);
    for await (const record of eventLog.readFrom(position + 1)) {
      const event = record.value;
      if (Date.now() - event.createdAt.getTime() > 1e3 * ttl) {
        log.info(`Skipping event (expired)`, record);
      } else {
        batch.push(event);
      }
      position = record.position;
      if (batch.length === maxBatchSize) break;
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

  const srv = service.create(name, task, interval * 1e3);

  return {
    name,
    start: srv.start,
    stop: srv.stop,
    position: readPosition,
  };
};
