import {
  NotifierEvent,
  NotifyEventFunction,
  NotifyResult,
  NotificationChannelMiddleware,
  TezosNodeEvent,
} from "../types";
import { debug } from "loglevel";
import * as nconf from "nconf";
import to from "await-to-js";
import { promisify } from "util";

type NotifierHistory = {
  nextEndorseLevel: number;
  nextBakeLevel: number;
};

type NotifyFilter = {
  history: NotifierHistory;
  channelName: string;
};

type Config = {
  channelName: string;
  storageDirectory: string;
};

/**
 * Create a middleware to wrap a notification channel with event filtering.
 */
export const create = async ({
  channelName,
  storageDirectory,
}: Config): Promise<NotificationChannelMiddleware> => {
  const historyPath = `${storageDirectory}/${channelName}FilterConfig.json`;
  const history = await loadHistory(historyPath);

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
          saveHistory(filter.history);
        }
        return result;
      } else {
        filter.history = updateHistory(filter.history, event);
        saveHistory(filter.history);
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

const nextEndorseLevelName = "nextEndorseLevel";
const nextBakeLevelName = "nextBakeLevel";

/**
 * Load notifier history from the file system or defaults.
 */
const loadHistory = async (path: string): Promise<NotifierHistory> => {
  nconf.file(path);
  const loadAsync = promisify(nconf.load);
  await to(loadAsync());

  const nextEndorseLevel = nconf.get(nextEndorseLevelName) || 0;
  const nextBakeLevel = nconf.get(nextBakeLevelName) || 0;
  const history: NotifierHistory = { nextEndorseLevel, nextBakeLevel };
  return history;
};

/**
 * Write the notifier history to the file system.
 */
const saveHistory = (history: NotifierHistory) => {
  nconf.set(nextEndorseLevelName, history.nextEndorseLevel);
  nconf.set(nextBakeLevelName, history.nextBakeLevel);

  nconf.save(null);
};
