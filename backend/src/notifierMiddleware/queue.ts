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
export const create = (
  config: Config,
  notify: (event: NotifierEvent | TezosNodeEvent) => void
): NotificationChannelMiddleware => {
  return (notifyFunction: NotifyEventFunction): NotifyEventFunction => {
    const store = new SqlLiteStore<NotifierEvent | TezosNodeEvent>({
      path: normalize(
        `${config.storageDirectory}/${config.channelName}Notifier.db`
      ),
    });
    const queue: BetterQueue<NotifierEvent | TezosNodeEvent> = new BetterQueue(
      // callback: (error, result) => void
      async (event: TezosNodeEvent | NotifierEvent, callback) => {
        const result = await notifyFunction(event);

        switch (result.kind) {
          case "ERROR":
            callback(result, null);
            notify({
              type: "NOTIFIER",
              kind: "ERROR",
              channelName: config.channelName,
              message: `Error sending ${config.channelName} notification`,
            });
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
      // Default to success since we queued it successfully.  Queue will use callback in the case of
      // future failures.
      return { kind: "SUCCESS" };
    };
  };
};
