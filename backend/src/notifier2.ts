import { TezosNodeEvent, Sender } from "./types";
import { debug, error } from "loglevel";
import { EventLog } from "./eventlog";

import { normalize } from "path";

import { delay } from "./delay";

import { writeJson, readJson, ensureExists } from "./fs-utils";

export type Channel = {
  name: string;
  start: () => Promise<void>;
};

// export type Notifier = {
//   post: (event: TezosNodeEvent) => Promise<void>;
// };

export const createChannel = (
  name: string,
  send: Sender,
  storageDirectory: string,
  eventLog: EventLog
): Channel => {
  const path = normalize(`${storageDirectory}/consumers/${name}`);

  const start = async () => {
    const readOffset = async () => (await readJson(path)) as number;
    const writeOffset = async (value: number) => await writeJson(path, value);

    await ensureExists(path, 0);

    debug("[${name}] starting...");
    while (true) {
      let batch: TezosNodeEvent[] = [];
      let offset = await readOffset();
      debug(`[${name}] reading from position ${offset}`);
      while (true) {
        const event = (await eventLog.get(offset + 1)) as TezosNodeEvent;
        if (!event) break;
        offset++;
        batch.push(event);
      }
      debug(`Read batch of ${batch.length}, last position ${offset}`);
      try {
        await send(batch);
        await writeOffset(offset);
      } catch (err) {
        error("Could not send", err);
      }
      await delay(60000);
    }
  };

  return {
    name,
    start,
  };
};
