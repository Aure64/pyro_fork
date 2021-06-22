import { IncomingWebhook } from "@slack/webhook";
import { TezosNodeEvent, Sender } from "../types";
import format from "../format";

export type SlackConfig = { enabled: boolean; url: string };

export type SlackNotificationChannel = {
  webhook: IncomingWebhook;
};

export const create = (config: SlackConfig): Sender => {
  const webhook = new IncomingWebhook(config.url);

  return async (events: TezosNodeEvent[]) => {
    let text = format(events);
    await webhook.send(text);
  };
};
