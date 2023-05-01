import { IncomingWebhook } from "@slack/webhook";
import { Events, Event, Sender, FilteredSender } from "../events";
import format from "../format";
import { chunk } from "lodash";

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
    //slack splits large text into multiple messages automatically
    //but in doing so it breaks markup (markup beginning in one message,
    //markup and in another), so we have to chunk it ourselves
    const chunks = chunk(lines, 20);
    for (const chunk of chunks) {
      const text = chunk.join("\n");
      await webhook.send("```\n" + text + "\n```");
    }
  }, config);
};
