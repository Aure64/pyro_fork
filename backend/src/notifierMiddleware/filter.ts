import {
  NotifierEvent,
  NotifyEventFunction,
  NotifyResult,
  NotificationChannelMiddleware,
  TezosNodeEvent,
} from "../types";
import { debug } from "loglevel";

type NotifierHistory = {
  nextEndorseLevel: number;
  nextBakeLevel: number;
};

type NotifyFilter = {
  history: NotifierHistory;
  channelName: string;
};

/**
 * Create a middleware to wrap a notification channel with event filtering.
 */
export const create = (channelName: string): NotificationChannelMiddleware => {
  const history: NotifierHistory = { nextEndorseLevel: 0, nextBakeLevel: 0 };
  const filter: NotifyFilter = { history, channelName };
  return (notifyFunction: NotifyEventFunction): NotifyEventFunction => {
    return async (
      event: TezosNodeEvent | NotifierEvent
    ): Promise<NotifyResult> => {
      if (shouldNotify(filter, event)) {
        const result = await notifyFunction(event);
        // only update history if the event was successfully delivered
        if (result.kind === "SUCCESS") {
          filter.history = updateHistory(filter.history, event);
        }
        return result;
      } else {
        filter.history = updateHistory(filter.history, event);
        // return success for ignored events
        return { kind: "SUCCESS" };
      }
    };
  };
};

export const shouldNotify = (
  filter: NotifyFilter,
  event: TezosNodeEvent | NotifierEvent
): boolean => {
  const { history } = filter;
  if (
    event.type === "BAKER" &&
    event.kind === "FUTURE_ENDORSING_OPPORTUNITY" &&
    event.level <= history.nextEndorseLevel
  ) {
    debug(
      `Endorsing event at level (${event.level}) excluded because it is earlier than previously reported event (${history.nextEndorseLevel})`
    );
    return false;
  }
  if (
    event.type === "BAKER" &&
    event.kind === "FUTURE_BAKING_OPPORTUNITY" &&
    event.level <= history.nextBakeLevel
  ) {
    debug(
      `Baking event at level (${event.level}) excluded because it is earlier than previously reported event (${history.nextBakeLevel})`
    );
    return false;
  }
  if (event.type === "NOTIFIER" && event.channelName === filter.channelName) {
    debug(
      `Notification event excluded because it originated from the same channel (${filter.channelName})`
    );
    return false;
  }

  return true;
};

const updateHistory = (
  history: NotifierHistory,
  event: TezosNodeEvent | NotifierEvent
): NotifierHistory => {
  let { nextBakeLevel, nextEndorseLevel } = history;
  if (event.type === "BAKER" && event.kind === "FUTURE_ENDORSING_OPPORTUNITY") {
    nextEndorseLevel = Math.max(nextEndorseLevel, event.level);
  }
  if (event.type === "BAKER" && event.kind === "FUTURE_BAKING_OPPORTUNITY") {
    nextBakeLevel = Math.max(nextBakeLevel, event.level);
  }

  return {
    nextBakeLevel,
    nextEndorseLevel,
  };
};
