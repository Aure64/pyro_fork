import {
  NotifierEvent,
  NotificationChannelMiddleware,
  NotifyEventFunction,
  NotifyResult,
  TezosNodeEvent,
} from "../types";
import * as BetterQueue from "better-queue";
import * as SqlLiteStore from "better-queue-sqlite";
import { normalize } from "path";
import { debug } from "loglevel";

export type Config = {
  maxRetries: number;
  retryDelay: number;
  storageDirectory: string;
  channelName: string;
};

/**
 * Middleware that adds a job queue to a notification channel.  Channel will use required `notify` function
 * to dispatch any failures.
 */
export const create = (config: Config): NotificationChannelMiddleware => {
  return (notifyFunction: NotifyEventFunction): NotifyEventFunction => {
    const path = normalize(
      `${config.storageDirectory}/${config.channelName}Notifier.db`
    );
    debug(`Loading notification channel queue from ${path}`);
    const store = new SqlLiteStore<NotifierEvent | TezosNodeEvent>({ path });
    const queue: BetterQueue<NotifierEvent | TezosNodeEvent> = new BetterQueue(
      // callback: (error, result) => void
      async (event: TezosNodeEvent | NotifierEvent, callback) => {
        const result = await notifyFunction(event);

        switch (result.kind) {
          case "ERROR":
            callback(result, null);
            break;

          default:
            callback(null, result);
        }
      },
      { maxRetries: config.maxRetries, retryDelay: config.retryDelay, store }
    );
    return async (
      event: TezosNodeEvent | NotifierEvent
    ): Promise<NotifyResult> => {
      queue.push(event);
      // Because events are queued up to deliver in the future, we can't resolve success or failure.
      // Default to success since we queued it successfully.  use failureHandler middleware to
      // receive messages about failures.
      return { kind: "SUCCESS" };
    };
  };
};
