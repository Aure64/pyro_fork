import { NotifyEventFunction, NotifierEvent, TezosNodeEvent } from "./types";
import * as EmailChannel from "./emailNotificationChannel";
import * as DesktopChannel from "./desktopNotificationChannel";
import * as SlackChannel from "./slackNotificationChannel";
import * as TelegramChannel from "./telegramNotificationChannel";
import * as EndpointChannel from "./endpointNotificationChannel";
import { apply as applyToString } from "./notifierMiddleware/toString";
import { apply as bindNotifier } from "./notifierMiddleware/bindNotifier";
import { create as createFilter } from "./notifierMiddleware/filter";
import { create as createQueue } from "./notifierMiddleware/queue";
import { trace } from "loglevel";
import { Config } from "./config";

export type NotifierConfig = {
  emailConfig?: EmailChannel.EmailConfig;
  desktopConfig?: DesktopChannel.DesktopConfig;
  slackConfig?: SlackChannel.SlackConfig;
  telegramConfig?: TelegramChannel.TelegramConfig;
  endpointConfig?: EndpointChannel.EndpointConfig;
  queue: {
    maxRetries: number;
    retryDelay: number;
  };
  storageDirectory: string;
  config: Config;
};

type Notifier = {
  channels: NotifyEventFunction[];
};

/**
 * Create and configure the notifier for use with `notify(,)`.
 */
export const create = async (config: NotifierConfig): Promise<Notifier> => {
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
      config: config.config,
    });

    const emailChannel = applyQueue(applyFilter(applyToString(emailNotify)));
    channels.push(emailChannel);
  }

  if (config.desktopConfig?.enabled) {
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
      config: config.config,
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
      config: config.config,
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
      config: config.config,
    });
    const telegramChannel = applyQueue(
      applyFilter(applyToString(telegramNotify))
    );
    channels.push(telegramChannel);
  }
  if (config.endpointConfig) {
    // we don't use bindNotifier and toString like other channels as this channel uses
    // the raw JSON event, not a toString'ed representation
    const endpointNotifier = EndpointChannel.create(config.endpointConfig);
    const endpointNotify: NotifyEventFunction = (event) =>
      EndpointChannel.notify(endpointNotifier, event);
    const applyQueue = createQueue(
      {
        ...config.queue,
        storageDirectory: config.storageDirectory,
        channelName: EndpointChannel.channelName,
      },
      boundNotify
    );
    const applyFilter = await createFilter({
      channelName: EndpointChannel.channelName,
      config: config.config,
    });
    const endpointChannel = applyQueue(applyFilter(endpointNotify));
    channels.push(endpointChannel);
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
