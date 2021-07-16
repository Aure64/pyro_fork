import { IncomingWebhook } from "@slack/webhook";
import { Event, Sender } from "../types2";
import format from "../format2";

export type SlackConfig = {
  enabled: boolean;
  url: string;
  emoji: boolean;
  short_address: boolean;
};

export type SlackNotificationChannel = {
  webhook: IncomingWebhook;
};

export const create = (config: SlackConfig): Sender => {
  const webhook = new IncomingWebhook(config.url);

  return async (events: Event[]) => {
    const lines = format(events, config.emoji, config.short_address);
    const text = lines.join("\n");
    await webhook.send(text);
  };
};
