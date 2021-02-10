import { IncomingWebhook } from "@slack/webhook";
import { Notify } from "./types";

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
  event
) => {
  try {
    await notifier.webhook.send(event.message);
    return { kind: "SUCCESS" };
  } catch (error) {
    return { kind: "ERROR", error };
  }
};
