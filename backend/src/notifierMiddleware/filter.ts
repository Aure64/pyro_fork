import {
  NotifierEvent,
  NotifyEventFunction,
  NotifyResult,
  NotificationChannelMiddleware,
  TezosNodeEvent,
} from "../types";
import { debug } from "loglevel";
import * as Config from "../config";

type NotifierHistory = {
  nextEndorseLevel: number;
  nextBakeLevel: number;
};

type NotifyFilter = {
  history: NotifierHistory;
  channelName: string;
  excludedEvents: string[];
};

type Config = {
  channelName: string;
};

/**
 * Create a middleware to wrap a notification channel with event filtering.
 */
export const create = async ({
  channelName,
}: Config): Promise<NotificationChannelMiddleware> => {
  const BAKE_KEY = `filter:${channelName}:nextBakeLevel`;
  const ENDORSE_KEY = `filter:${channelName}:nextEndorseLevel`;
  const history = {
    nextBakeLevel: Config.getNumber(BAKE_KEY) || 0,
    nextEndorseLevel: Config.getNumber(ENDORSE_KEY) || 0,
  };
  const excludedEvents = Config.getExcludedEvents();

  const filter: NotifyFilter = { history, channelName, excludedEvents };
  return (notifyFunction: NotifyEventFunction): NotifyEventFunction => {
    return async (
      event: TezosNodeEvent | NotifierEvent
    ): Promise<NotifyResult> => {
      if (shouldNotify(filter, event)) {
        const result = await notifyFunction(event);
        // only update history if the event was successfully delivered
        if (result.kind === "SUCCESS") {
          filter.history = updateHistory(filter.history, event);
          Config.setNumber(BAKE_KEY, filter.history.nextBakeLevel);
          Config.setNumber(ENDORSE_KEY, filter.history.nextEndorseLevel);
        }
        return result;
      } else {
        filter.history = updateHistory(filter.history, event);
        Config.setNumber(BAKE_KEY, filter.history.nextBakeLevel);
        Config.setNumber(ENDORSE_KEY, filter.history.nextEndorseLevel);
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
  if (
    (event.type === "BAKER" || event.type === "PEER") &&
    filter.excludedEvents.includes(event.kind)
  ) {
    debug(`Event excluded because type ${event.kind} is filtered`);
    return false;
  }

  return true;
};

/**
 * Update notifier's history if necessary based on the provided event.
 */
export const updateHistory = (
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
