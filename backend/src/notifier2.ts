import { TezosNodeEvent, Sender } from "./types";
import { debug, info, error } from "loglevel";
import { EventLog } from "./eventlog";

import { normalize } from "path";

import { delay2, CancellableDelay } from "./delay";

import { writeJson, readJson, ensureExists } from "./fs-utils";

export type Channel = {
  name: string;
  start: () => Promise<void>;
  stop: () => void;
};

export const createChannel = (
  name: string,
  send: Sender,
  storageDirectory: string,
  eventLog: EventLog
): Channel => {
  const path = normalize(`${storageDirectory}/consumers/${name}`);

  let shouldRun = true;
  let currentDelay: CancellableDelay | undefined;

  const readPosition = async () => (await readJson(path)) as number;
  const writePosition = async (value: number) => await writeJson(path, value);

  const start = async () => {
    await ensureExists(path, 0);

    info(`[${name}] starting...`);
    try {
      while (shouldRun) {
        const batch: TezosNodeEvent[] = [];
        let position = await readPosition();
        debug(`[${name}] reading from position ${position}`);
        for await (const record of eventLog.readAfter(position)) {
          batch.push(record.value);
          position = record.position;
        }
        debug(
          `[${name}] Read batch of ${batch.length}, last position ${position}`
        );
        if (batch.length > 0) {
          try {
            await send(batch);
            await writePosition(position);
          } catch (err) {
            error(`[${name}] could not send`, err);
          }
        }
        if (!shouldRun) break;
        currentDelay = delay2(60000);
        await currentDelay.promise;
      }
    } catch (err) {
      error(err);
    }
    info(`[${name}] done`);
  };

  const stop = () => {
    info(`[${name}] stopping...`);
    shouldRun = false;
    currentDelay?.cancel();
  };

  return {
    name,
    start,
    stop,
  };
};
