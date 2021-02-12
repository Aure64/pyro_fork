import { NotifyResult, TezosNodeEvent } from "./types";
import * as EmailChannel from "./emailNotificationChannel";
import * as DesktopChannel from "./desktopNotificationChannel";
import * as SlackChannel from "./slackNotificationChannel";
import * as TelegramChannel from "./telegramNotificationChannel";
import { debug, error } from "loglevel";
import * as BetterQueue from "better-queue";
import * as SqlLiteStore from "better-queue-sqlite";

type NotifierService = "EMAIL" | "DESKTOP" | "SLACK" | "TELEGRAM";

type NotificationJob = {
  service: NotifierService;
  event: TezosNodeEvent;
};

export type Config = {
  emailConfig?: EmailChannel.Config;
  desktopConfig?: DesktopChannel.Config;
  slackConfig?: SlackChannel.Config;
  telegramConfig?: TelegramChannel.Config;
  maxRetries: number;
  retryDelay: number;
};

type Notifier = {
  queue: BetterQueue<NotificationJob>;
  emailChannel: EmailChannel.EmailNotificationChannel | undefined;
  desktopChannel: DesktopChannel.DesktopNotificationChannel | undefined;
  slackChannel: SlackChannel.SlackNotificationChannel | undefined;
  telegramChannel: TelegramChannel.TelegramNotificationChannel | undefined;
};

/**
 * Create and configure the notifier for use with `notify(,)`.
 */
export const create = (config: Config): Notifier => {
  const emailChannel = config.emailConfig
    ? EmailChannel.create(config.emailConfig)
    : undefined;
  const desktopChannel = config.desktopConfig
    ? DesktopChannel.create(config.desktopConfig)
    : undefined;
  const slackChannel = config.slackConfig
    ? SlackChannel.create(config.slackConfig)
    : undefined;
  const telegramChannel = config.telegramConfig
    ? TelegramChannel.create(config.telegramConfig)
    : undefined;

  const store = new SqlLiteStore<NotificationJob>();
  const notifier: Notifier = {
    queue: new BetterQueue(
      // callback: (error, result) => void
      async (event, callback) => {
        const result = await handleJob(notifier, event);

        switch (result.kind) {
          case "ERROR":
            callback(result, null);
            break;

          default:
            callback(null, result);
        }
      },
      { maxRetries: config.maxRetries, retryDelay: config.retryDelay, store }
    ),
    emailChannel,
    desktopChannel,
    slackChannel,
    telegramChannel,
  };

  return notifier;
};

/**
 * Push Tezos event onto notification job queue.  If notification fails for a certain type (eg email)
 * it will automatically be retried according to your retry settings in Config.
 */
export const notify = (notifier: Notifier, event: TezosNodeEvent): void => {
  if (notifier.emailChannel) notifier.queue.push({ service: "EMAIL", event });
  if (notifier.desktopChannel)
    notifier.queue.push({ service: "DESKTOP", event });
  if (notifier.slackChannel) notifier.queue.push({ service: "SLACK", event });
  if (notifier.telegramChannel)
    notifier.queue.push({ service: "TELEGRAM", event });
};

/**
 * Send notification event to the appropriate notifier.  If the notifier is unavailable, an error
 * will be returned.
 */
const handleJob = (
  notifier: Notifier,
  job: NotificationJob
): Promise<NotifyResult> => {
  switch (job.service) {
    case "EMAIL":
      if (notifier.emailChannel) {
        debug("Event sent to email notifier");
        return EmailChannel.notify(notifier.emailChannel, job.event);
      } else {
        error(
          "Received notification job for email, but no email notifier is configured"
        );
        return Promise.resolve({
          kind: "ERROR",
          error: new Error("No email notifier configured"),
        });
      }
    case "DESKTOP":
      if (notifier.desktopChannel) {
        debug("Event sent to desktop notifier");
        return DesktopChannel.notify(notifier.desktopChannel, job.event);
      } else {
        error(
          "Received notification job for desktop, but no desktop notifier is configured"
        );
        return Promise.resolve({
          kind: "ERROR",
          error: new Error("No desktop notifier configured"),
        });
      }
    case "SLACK":
      if (notifier.slackChannel) {
        debug("Event sent to slack notifier");
        return SlackChannel.notify(notifier.slackChannel, job.event);
      } else {
        error(
          "Received notification job for slack, but no slack notifier is configured"
        );
        return Promise.resolve({
          kind: "ERROR",
          error: new Error("No slack notifier configured"),
        });
      }
    case "TELEGRAM":
      if (notifier.telegramChannel) {
        debug("Event sent to telegram notifier");
        return TelegramChannel.notify(notifier.telegramChannel, job.event);
      } else {
        error(
          "Received notification job for telegram, but no telegram notifier is configured"
        );
        return Promise.resolve({
          kind: "ERROR",
          error: new Error("No telegram notifier configured"),
        });
      }
  }
};
