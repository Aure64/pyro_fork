import { IncomingWebhook } from "@slack/webhook";
import { Event, Sender } from "../types2";
import format from "../format2";

export type SlackConfig = { enabled: boolean; url: string };

export type SlackNotificationChannel = {
  webhook: IncomingWebhook;
};

export const create = (config: SlackConfig): Sender => {
  const webhook = new IncomingWebhook(config.url);

  return async (events: Event[]) => {
    const text = format(events);
    await webhook.send(text);
  };
};
