import {
  NotifierEvent,
  NotifyEventFunction,
  NotifyResult,
  NotificationChannelMiddleware,
  TezosNodeEvent,
} from "../types";
import { debug } from "loglevel";

type OfflineStatus = {
  consecutiveBakerMonitorFailures: number;
  consecutiveNodeMonitorFailures: number;
};

type OfflineFilter = {
  status: OfflineStatus;
  channelName: string;
};

type OfflineFilterConfig = {
  channelName: string;
};

/**
 * Create a middleware to wrap a notification channel with filtering of events when offline.
 * Function will also dispatch an additional message when it detects that the network has reconnected.
 */
export const create = async ({
  channelName,
}: OfflineFilterConfig): Promise<NotificationChannelMiddleware> => {
  const status = {
    consecutiveBakerMonitorFailures: 0,
    consecutiveNodeMonitorFailures: 0,
  };
  const filter: OfflineFilter = { status, channelName };
  return (notifyFunction: NotifyEventFunction): NotifyEventFunction => {
    return async (
      event: TezosNodeEvent | NotifierEvent
    ): Promise<NotifyResult> => {
      if (shouldNotify(filter, event)) {
        const result = await notifyFunction(event);
        // only update history if the event was successfully delivered
        if (result.kind === "SUCCESS") {
          const newStatus = updateStatus(filter.status, event);
          // check for a special connection change event based on status changes
          const connectionEvent = getConnectionChangeEvent(
            filter.status,
            newStatus
          );
          if (connectionEvent) {
            await notifyFunction(connectionEvent);
          }
          filter.status = newStatus;
        }
        return result;
      } else {
        filter.status = updateStatus(filter.status, event);
        // return success for ignored events
        return { kind: "SUCCESS" };
      }
    };
  };
};

const OFFLINE_THRESHOLD = 5;

const isBakerMonitorOffline = (status: OfflineStatus): boolean => {
  return status.consecutiveBakerMonitorFailures >= OFFLINE_THRESHOLD;
};

const isNodeMonitorOffline = (status: OfflineStatus): boolean => {
  return status.consecutiveNodeMonitorFailures >= OFFLINE_THRESHOLD;
};

export const getConnectionChangeEvent = (
  previousStatus: OfflineStatus,
  newStatus: OfflineStatus
): TezosNodeEvent | null => {
  if (
    isBakerMonitorOffline(previousStatus) &&
    !isBakerMonitorOffline(newStatus)
  ) {
    // baker monitor went online
    const message = "Baker monitor is back online";
    debug(message);
    return {
      type: "BAKER_DATA",
      kind: "RECONNECTED",
      message,
    };
  }
  if (
    !isBakerMonitorOffline(previousStatus) &&
    isBakerMonitorOffline(newStatus)
  ) {
    // baker monitor went offline
    const message = "Baker monitor has gone offline";
    debug(message);
    return {
      type: "BAKER_DATA",
      kind: "ERROR",
      message,
    };
  }
  if (
    isNodeMonitorOffline(previousStatus) &&
    !isNodeMonitorOffline(newStatus)
  ) {
    // node monitor went online
    const message = "Node monitor is back online";
    debug(message);
    return {
      type: "PEER_DATA",
      kind: "RECONNECTED",
      message,
    };
  }
  if (
    !isNodeMonitorOffline(previousStatus) &&
    isNodeMonitorOffline(newStatus)
  ) {
    // node monitor went offline
    const message = "Unable to reach node";
    debug(message);
    return {
      type: "PEER_DATA",
      kind: "ERROR",
      message,
    };
  }
  return null;
};

export const shouldNotify = (
  filter: OfflineFilter,
  event: TezosNodeEvent | NotifierEvent
): boolean => {
  const { status } = filter;
  if (
    event.type === "BAKER_DATA" &&
    event.kind === "ERROR" &&
    isBakerMonitorOffline(status)
  ) {
    debug(`Baking error event excluded because baker monitor is offline`);
    return false;
  }
  if (
    event.type === "PEER_DATA" &&
    event.kind === "ERROR" &&
    isNodeMonitorOffline(status)
  ) {
    debug(`Node error event excluded because node monitor is offline`);
    return false;
  }

  return true;
};

/**
 * Update notifier status if necessary based on the provided event.
 */
export const updateStatus = (
  history: OfflineStatus,
  event: TezosNodeEvent | NotifierEvent
): OfflineStatus => {
  let {
    consecutiveBakerMonitorFailures,
    consecutiveNodeMonitorFailures,
  } = history;
  // update consecutiveBakerMonitorFailures
  if (event.type === "BAKER_DATA" && event.kind === "ERROR") {
    consecutiveBakerMonitorFailures++;
    debug(
      `Baker monitor has had ${consecutiveBakerMonitorFailures} consecutive failures`
    );
  } else if (event.type.includes("BAKER") || event.type.includes("BAKING")) {
    // any other baking event means the monitor is back online
    consecutiveBakerMonitorFailures = 0;
  }
  // update consecutiveNodeMonitorFailures
  if (event.type === "PEER_DATA" && event.kind === "ERROR") {
    consecutiveNodeMonitorFailures++;
    debug(
      `Node monitor has had ${consecutiveNodeMonitorFailures} consecutive failures`
    );
  } else if (event.type === "PEER") {
    // any other peer event means the monitor is back online
    consecutiveNodeMonitorFailures = 0;
  }

  return {
    consecutiveBakerMonitorFailures,
    consecutiveNodeMonitorFailures,
  };
};
