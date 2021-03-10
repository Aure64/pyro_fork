import { IncomingWebhook } from "@slack/webhook";
import { Notify } from "./types";

export const channelName = "slack";

export type Config = { url: string };

export type SlackNotificationChannel = {
  webhook: IncomingWebhook;
};

export const create = (config: Config): SlackNotificationChannel => {
  const webhook = new IncomingWebhook(config.url);
  return { webhook };
};

export const notify: Notify<SlackNotificationChannel> = async (
  notifier,
  message
) => {
  try {
    await notifier.webhook.send(message);
    return { kind: "SUCCESS" };
  } catch (error) {
    return { kind: "ERROR", error, channelName };
  }
};
