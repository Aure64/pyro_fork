import {
  NotifyFunction,
  NotifyEventFunction,
  NotifierEvent,
  TezosNodeEvent,
} from "../types";

/**
 * Convert a notify channel from one that takes a string to one that takes an event.  This lets middleware
 * work with complete events while notification channels work with strings.
 */
export const apply = (notifyFunction: NotifyFunction): NotifyEventFunction => {
  return async (event: TezosNodeEvent | NotifierEvent) => {
    return notifyFunction(event.message);
  };
};
