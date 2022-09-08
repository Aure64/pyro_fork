import { IncomingWebhook } from "@slack/webhook";
import { Events, Event, Sender, FilteredSender } from "../events";
import format from "../format";

export type SlackConfig = {
  enabled: boolean;
  url: string;
  emoji: boolean;
  short_address: boolean;
  exclude: Events[];
};

export type SlackNotificationChannel = {
  webhook: IncomingWebhook;
};

export const create = (config: SlackConfig): Sender => {
  const webhook = new IncomingWebhook(config.url);

  return FilteredSender(async (events: Event[]) => {
    const lines = format(events, config.emoji, config.short_address);
    const text = lines.join("\n");
    await webhook.send(text);
  }, config);
};
