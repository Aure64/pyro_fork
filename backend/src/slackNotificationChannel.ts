import { IncomingWebhook } from "@slack/webhook";
import { Notify } from "./types";

export const channelName = "slack";

export type SlackConfig = { enabled: boolean; url: string };

export type SlackNotificationChannel = {
  webhook: IncomingWebhook;
};

export const create = (config: SlackConfig): SlackNotificationChannel => {
  const webhook = new IncomingWebhook(config.url);
  return { webhook };
};

export const notify: Notify<SlackNotificationChannel> = async (
  notifier,
  { message, title }
) => {
  try {
    await notifier.webhook.send(`${title}\n${message}`);
    return { kind: "SUCCESS" };
  } catch (error) {
    return { kind: "ERROR", error, channelName };
  }
};
