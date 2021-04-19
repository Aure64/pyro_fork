import {
  NotifierEvent,
  NotificationChannelMiddleware,
  NotifyEventFunction,
  NotifyResult,
  TezosNodeEvent,
} from "../types";
import { debug } from "loglevel";

/**
 * Middleware that notifies other notification channels when this channel fails.  Only notifies on
 * first failure per session.
 */
export const create = (
  channelName: string,
  notify: (event: NotifierEvent | TezosNodeEvent) => void
): NotificationChannelMiddleware => {
  return (notifyFunction: NotifyEventFunction): NotifyEventFunction => {
    let isWorking = true;

    return async (
      event: TezosNodeEvent | NotifierEvent
    ): Promise<NotifyResult> => {
      const result = await notifyFunction(event);
      if (result.kind === "SUCCESS") {
        if (isWorking === false) {
          debug(`${channelName} notification channel is working again`);
        }
        isWorking = true;
      } else {
        if (isWorking === true) {
          debug(`${channelName} notification channel has stopped working`);
          const errorEvent: NotifierEvent = {
            type: "NOTIFIER",
            channelName,
            message: `Error sending ${channelName} notification`,
          };
          notify(errorEvent);
        } else {
          debug(`${channelName} notification channel is still not working`);
        }
        isWorking = false;
      }
      return result;
    };
  };
};
