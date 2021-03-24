import fetch from "cross-fetch";
import { NotifierEvent, NotifyResult, TezosNodeEvent } from "./types";
import { debug, trace } from "loglevel";

export const channelName = "endpoint";

export type EndpointConfig = { url: string };

export type EndpointNotificationChannel = {
  url: string;
};

export const create = ({
  url,
}: EndpointConfig): EndpointNotificationChannel => {
  return { url };
};

export const notify = async (
  notifier: EndpointNotificationChannel,
  event: TezosNodeEvent | NotifierEvent
): Promise<NotifyResult> => {
  const url = notifier.url;
  const method = "POST";
  const body = JSON.stringify(event);
  const result = await fetch(url, { body, method });
  if (result.ok) {
    trace("Successfully sent event ${event} to endpoint");
    return { kind: "SUCCESS" };
  } else {
    debug(
      `Error submitting event ${event} to endpoint because of status ${result.status}`
    );
    const error = new Error("Error posting event to endpoint");
    return { kind: "ERROR", error, channelName };
  }
};
