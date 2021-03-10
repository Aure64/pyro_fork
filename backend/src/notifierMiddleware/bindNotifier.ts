import { Notify, NotifyFunction } from "../types";

/**
 * Take a channel and its notify function and return a single function that just needs a message.
 * This simplifies use of notifier channels in function pipelines with middleware.
 */
export const apply = <T>(channel: T, notify: Notify<T>): NotifyFunction => {
  return async (message: string) => {
    return notify(channel, message);
  };
};
