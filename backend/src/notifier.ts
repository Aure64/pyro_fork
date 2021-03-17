import { NotifyEventFunction, NotifierEvent, TezosNodeEvent } from "./types";
import * as EmailChannel from "./emailNotificationChannel";
import * as DesktopChannel from "./desktopNotificationChannel";
import * as SlackChannel from "./slackNotificationChannel";
import * as TelegramChannel from "./telegramNotificationChannel";
import { apply as applyToString } from "./notifierMiddleware/toString";
import { apply as bindNotifier } from "./notifierMiddleware/bindNotifier";
import { create as createFilter } from "./notifierMiddleware/filter";
import { create as createQueue } from "./notifierMiddleware/queue";
import { trace } from "loglevel";

export type Config = {
  emailConfig?: EmailChannel.Config;
  desktopConfig?: DesktopChannel.Config;
  slackConfig?: SlackChannel.Config;
  telegramConfig?: TelegramChannel.Config;
  queue: {
    maxRetries: number;
    retryDelay: number;
  };
  storageDirectory: string;
};

type Notifier = {
  channels: NotifyEventFunction[];
};

/**
 * Create and configure the notifier for use with `notify(,)`.
 */
export const create = async (config: Config): Promise<Notifier> => {
  const channels: NotifyEventFunction[] = [];
  const notifier: Notifier = {
    channels,
  };
  const boundNotify = (event: TezosNodeEvent | NotifierEvent) =>
    notify(notifier, event);

  if (config.emailConfig) {
    const emailNotify = bindNotifier(
      EmailChannel.create(config.emailConfig),
      EmailChannel.notify
    );
    const applyQueue = createQueue(
      {
        ...config.queue,
        storageDirectory: config.storageDirectory,
        channelName: EmailChannel.channelName,
      },
      boundNotify
    );
    const applyFilter = await createFilter({
      channelName: EmailChannel.channelName,
    });

    const emailChannel = applyQueue(applyFilter(applyToString(emailNotify)));
    channels.push(emailChannel);
  }

  if (config.desktopConfig) {
    const desktopNotify = bindNotifier(
      DesktopChannel.create(config.desktopConfig),
      DesktopChannel.notify
    );
    const applyQueue = createQueue(
      {
        ...config.queue,
        storageDirectory: config.storageDirectory,
        channelName: DesktopChannel.channelName,
      },
      boundNotify
    );
    const applyFilter = await createFilter({
      channelName: DesktopChannel.channelName,
    });
    const desktopChannel = applyQueue(
      applyFilter(applyToString(desktopNotify))
    );
    channels.push(desktopChannel);
  }
  if (config.slackConfig) {
    const slackNotify = bindNotifier(
      SlackChannel.create(config.slackConfig),
      SlackChannel.notify
    );
    const applyQueue = createQueue(
      {
        ...config.queue,
        storageDirectory: config.storageDirectory,
        channelName: SlackChannel.channelName,
      },
      boundNotify
    );
    const applyFilter = await createFilter({
      channelName: SlackChannel.channelName,
    });
    const slackChannel = applyQueue(applyFilter(applyToString(slackNotify)));
    channels.push(slackChannel);
  }
  if (config.telegramConfig) {
    const telegramNotify = bindNotifier(
      TelegramChannel.create(config.telegramConfig),
      TelegramChannel.notify
    );
    const applyQueue = createQueue(
      {
        ...config.queue,
        storageDirectory: config.storageDirectory,
        channelName: TelegramChannel.channelName,
      },
      boundNotify
    );
    const applyFilter = await createFilter({
      channelName: TelegramChannel.channelName,
    });
    const telegramChannel = applyQueue(
      applyFilter(applyToString(telegramNotify))
    );
    channels.push(telegramChannel);
  }

  return notifier;
};

/**
 * Push Tezos event onto notification job queue.  If a notification fails it will automatically
 * be retried according to your retry settings in Config.
 */
export const notify = (
  notifier: Notifier,
  event: TezosNodeEvent | NotifierEvent
): void => {
  trace(`Notifier received event ${JSON.stringify(event)}`);
  for (const channel of notifier.channels) {
    channel(event);
  }
};
