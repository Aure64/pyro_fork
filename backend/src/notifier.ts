import { NotifyEventFunction, NotifierEvent, TezosNodeEvent } from "./types";
import * as EmailChannel from "./emailNotificationChannel";
import * as DesktopChannel from "./desktopNotificationChannel";
import * as SlackChannel from "./slackNotificationChannel";
import * as TelegramChannel from "./telegramNotificationChannel";
import * as EndpointChannel from "./endpointNotificationChannel";
import { apply as applyToString } from "./notifierMiddleware/toString";
import { apply as bindNotifier } from "./notifierMiddleware/bindNotifier";
import { create as createFilter } from "./notifierMiddleware/filter";
import { create as createOfflineFilter } from "./notifierMiddleware/offlineFilter";
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
    const channelName = EmailChannel.channelName;
    const emailNotify = bindNotifier(
      EmailChannel.create(config.emailConfig),
      EmailChannel.notify
    );
    const applyQueue = createQueue(
      {
        ...config.queue,
        storageDirectory: config.storageDirectory,
        channelName,
      },
      boundNotify
    );
    const applyFilter = await createFilter({
      channelName,
      config: config.config,
    });
    const applyOfflineFilter = await createOfflineFilter({
      channelName,
    });

    const emailChannel = applyQueue(
      applyFilter(applyOfflineFilter(applyToString(emailNotify)))
    );
    channels.push(emailChannel);
  }

  if (config.desktopConfig?.enabled) {
    const channelName = DesktopChannel.channelName;
    const desktopNotify = bindNotifier(
      DesktopChannel.create(config.desktopConfig),
      DesktopChannel.notify
    );
    const applyQueue = createQueue(
      {
        ...config.queue,
        storageDirectory: config.storageDirectory,
        channelName,
      },
      boundNotify
    );
    const applyFilter = await createFilter({
      channelName,
      config: config.config,
    });
    const applyOfflineFilter = await createOfflineFilter({
      channelName,
    });
    const desktopChannel = applyQueue(
      applyFilter(applyOfflineFilter(applyToString(desktopNotify)))
    );
    channels.push(desktopChannel);
  }
  if (config.slackConfig) {
    const channelName = SlackChannel.channelName;
    const slackNotify = bindNotifier(
      SlackChannel.create(config.slackConfig),
      SlackChannel.notify
    );
    const applyQueue = createQueue(
      {
        ...config.queue,
        storageDirectory: config.storageDirectory,
        channelName,
      },
      boundNotify
    );
    const applyFilter = await createFilter({
      channelName,
      config: config.config,
    });
    const applyOfflineFilter = await createOfflineFilter({
      channelName,
    });
    const slackChannel = applyQueue(
      applyFilter(applyOfflineFilter(applyToString(slackNotify)))
    );
    channels.push(slackChannel);
  }
  if (config.telegramConfig) {
    const channelName = TelegramChannel.channelName;
    const telegramNotify = bindNotifier(
      TelegramChannel.create(config.telegramConfig),
      TelegramChannel.notify
    );
    const applyQueue = createQueue(
      {
        ...config.queue,
        storageDirectory: config.storageDirectory,
        channelName,
      },
      boundNotify
    );
    const applyFilter = await createFilter({
      channelName,
      config: config.config,
    });
    const applyOfflineFilter = await createOfflineFilter({
      channelName,
    });
    const telegramChannel = applyQueue(
      applyFilter(applyOfflineFilter(applyToString(telegramNotify)))
    );
    channels.push(telegramChannel);
  }
  if (config.endpointConfig) {
    const channelName = EndpointChannel.channelName;
    // we don't use bindNotifier and toString like other channels as this channel uses
    // the raw JSON event, not a toString'ed representation
    const endpointNotifier = EndpointChannel.create(config.endpointConfig);
    const endpointNotify: NotifyEventFunction = (event) =>
      EndpointChannel.notify(endpointNotifier, event);
    const applyQueue = createQueue(
      {
        ...config.queue,
        storageDirectory: config.storageDirectory,
        channelName,
      },
      boundNotify
    );
    const applyFilter = await createFilter({
      channelName,
      config: config.config,
    });
    const applyOfflineFilter = await createOfflineFilter({
      channelName,
    });
    const endpointChannel = applyQueue(
      applyFilter(applyOfflineFilter(endpointNotify))
    );
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
