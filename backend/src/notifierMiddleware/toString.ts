import {
  NotifyFunction,
  NotifyEventFunction,
  NotifierEvent,
  TezosNodeEvent,
} from "../types";
import * as Yaml from "js-yaml";

/**
 * Convert a notify channel from one that takes message and title strings to one that takes an event. This
 * lets middleware work with complete events while notification channels work with strings.
 */
export const apply = (notifyFunction: NotifyFunction): NotifyEventFunction => {
  return async (event: TezosNodeEvent | NotifierEvent) => {
    let title = `Kiln Event: ${event.type}`;
    if ("kind" in event) {
      title += ` (${event.kind})`;
    }
    const message = `${event.message}\n\nDetails:\n${Yaml.dump(event)}`;
    return notifyFunction({ title, message });
  };
};
