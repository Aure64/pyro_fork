import { getLogger } from "loglevel";
import * as storage from "./storage";
import * as service from "./service";

export type EventLogConsumer = {
  position: () => Promise<number>;
};

export type LogEntry<T> = {
  value: T;
  position: number;
};

export type EventLog<T> = {
  add: (event: T) => Promise<LogEntry<T>>;
  readFrom: (position: number) => AsyncIterableIterator<LogEntry<T>>;
  deleteUpTo: (position: number) => Promise<void>;
};

export const open = async <T>(
  storageDir: string,
  topic = "eventlog",
  maxSize = Number.MAX_SAFE_INTEGER
): Promise<EventLog<T>> => {
  const store = await storage.open([storageDir, topic]);

  const log = getLogger(topic);

  const SEQ_KEY = "_sequence";
  let sequence = (await store.get(SEQ_KEY, 0)) as number;

  const add = async (event: T): Promise<LogEntry<T>> => {
    log.debug(`about to store event ${sequence}`, event);
    const eventPos = sequence;
    store.putSync(eventPos, event);
    const nextSequenceValue = sequence + 1;
    store.putSync(SEQ_KEY, nextSequenceValue);
    sequence = nextSequenceValue;
    const beforeMinPosition = eventPos - maxSize;
    if (beforeMinPosition > -1) {
      await deleteUpTo(beforeMinPosition);
    }
    return { value: event, position: eventPos };
  };

  const read = async (position: number): Promise<LogEntry<T> | null> => {
    const value = (await store.get(position)) as T;
    log.debug(`got event at ${position}`, value);
    if (value !== null) {
      return { value, position };
    }
    return null;
  };

  const readFrom = async function* (
    position: number
  ): AsyncIterableIterator<LogEntry<T>> {
    let currentPosition = position < 0 ? sequence + position : position;
    while (currentPosition < sequence) {
      const record = await read(currentPosition);
      if (record) {
        yield record;
      }
      currentPosition++;
    }
  };

  const deleteUpTo = async (position: number): Promise<void> => {
    const keys = (await store.keys()).filter((k) => k !== SEQ_KEY);
    // const fileNames = await fs.promises.readdir(eventsDir);
    const toDelete = keys.filter((name) => parseInt(name) <= position);
    console.log(`About to delete ${toDelete.length} keys`, toDelete);
    log.debug(`About to delete ${toDelete.length} keys`, toDelete);
    await Promise.all(toDelete.map(store.remove));
  };

  return {
    add,
    readFrom,
    deleteUpTo,
  };
};

export const gc = <T>(
  eventLog: EventLog<T>,
  consumers: EventLogConsumer[]
): service.Service => {
  const name = "gc";

  const log = getLogger(name);

  const task = async () => {
    const positions = await Promise.all(consumers.map((c) => c.position()));
    log.debug(`Consumer positions`, positions);
    const minPosition = Math.min(...positions);
    log.debug(`Min consumer position is ${minPosition}`);
    try {
      await eventLog.deleteUpTo(minPosition);
    } catch (err) {
      log.error(err);
    }
  };

  const d = service.create("gc", task, 60 * 1e3);

  return {
    name,
    start: d.start,
    stop: d.stop,
  };
};
