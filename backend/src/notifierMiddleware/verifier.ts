import {
  NotifierEvent,
  NotificationChannelMiddleware,
  NotifyEventFunction,
} from "../types";
import { debug, info, warn } from "loglevel";
import { Config } from "../config";

/**
 * Middleware that sends a verification notification to a channel that hasn't been verified.
 */
export const create = (
  channelName: string,
  config: Config
): NotificationChannelMiddleware => {
  return (notifyFunction: NotifyEventFunction): NotifyEventFunction => {
    const verifiedKey = `${channelName}:verified`;
    const verified = config.getBoolean(verifiedKey);
    if (!verified) {
      info(`${channelName} is not verified. Sending test notification`);
      const message = `Test Pyrometer notification of ${channelName}`;
      const verificationEvent: NotifierEvent = {
        type: "NOTIFIER",
        channelName,
        message,
      };
      notifyFunction(verificationEvent).then((result) => {
        if (result.kind === "SUCCESS") {
          info(`${channelName} test notification succeeded`);
          config.setBoolean(verifiedKey, true);
        } else {
          warn(`${channelName} test notification failed`);
        }
      });
    } else {
      debug(`${channelName} already verified`);
    }

    // notifyFunction is returned unchanged
    return notifyFunction;
  };
};
