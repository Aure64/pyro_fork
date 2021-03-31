import {
  NotifierEvent,
  NotifyEventFunction,
  NotifyResult,
  NotificationChannelMiddleware,
  TezosNodeEvent,
} from "../types";
import { debug } from "loglevel";

type OfflineStatus = {
  isBakerMonitorOffline: boolean;
  isNodeMonitorOffline: boolean;
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
    isBakerMonitorOffline: false,
    isNodeMonitorOffline: false,
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

const getConnectionChangeEvent = (
  previousStatus: OfflineStatus,
  newStatus: OfflineStatus
): TezosNodeEvent | null => {
  if (
    !previousStatus.isBakerMonitorOffline &&
    newStatus.isBakerMonitorOffline
  ) {
    // baker monitor went online
    return {
      type: "BAKER_DATA",
      kind: "RECONNECTED",
      message: "Baker monitor is back online",
    };
  }
  if (previousStatus.isNodeMonitorOffline && !newStatus.isNodeMonitorOffline) {
    // node monitor went online
    return {
      type: "PEER_DATA",
      kind: "RECONNECTED",
      message: "Node monitor is back online",
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
    status.isBakerMonitorOffline
  ) {
    debug(`Baking error event excluded because baker monitor is offline`);
    return false;
  }
  if (
    event.type === "PEER_DATA" &&
    event.kind === "ERROR" &&
    status.isNodeMonitorOffline
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
  let { isBakerMonitorOffline, isNodeMonitorOffline } = history;
  // update isBakerMonitorOffline
  if (event.type === "BAKER_DATA" && event.kind === "ERROR") {
    isBakerMonitorOffline = true;
  } else if (event.type === "BAKER") {
    // any other baking event means the monitor is back online
    isBakerMonitorOffline = false;
  }
  // update isNodeMonitorOffline
  if (event.type === "PEER_DATA" && event.kind === "ERROR") {
    isNodeMonitorOffline = true;
  } else if (event.type === "PEER") {
    // any other peer event means the monitor is back online
    isNodeMonitorOffline = false;
  }

  return {
    isBakerMonitorOffline,
    isNodeMonitorOffline,
  };
};
