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
import { create as createFailureHandler } from "./notifierMiddleware/failureHandler";
import { trace } from "loglevel";
import { Config } from "./config";

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
  const queue = config.getQueueConfig();
  const storageDirectory = config.storageDirectory;
  const boundNotify = (event: TezosNodeEvent | NotifierEvent) =>
    notify(notifier, event);

  // email config
  const emailConfig = config.getEmailConfig();
  if (emailConfig?.enabled) {
    const channelName = EmailChannel.channelName;
    const emailNotify = bindNotifier(
      EmailChannel.create(emailConfig),
      EmailChannel.notify
    );
    const applyQueue = createQueue({
      ...queue,
      storageDirectory,
      channelName,
    });
    const applyFailureHandler = createFailureHandler(channelName, boundNotify);
    const applyFilter = await createFilter({
      channelName,
      config,
    });
    const applyOfflineFilter = await createOfflineFilter({
      channelName,
    });

    const emailChannel = applyQueue(
      applyFailureHandler(
        applyFilter(applyOfflineFilter(applyToString(emailNotify)))
      )
    );
    channels.push(emailChannel);
  }

  // desktop config
  const desktopConfig = config.getDesktopConfig();
  if (desktopConfig?.enabled) {
    const channelName = DesktopChannel.channelName;
    const desktopNotify = bindNotifier(
      DesktopChannel.create(desktopConfig),
      DesktopChannel.notify
    );
    const applyQueue = createQueue({
      ...queue,
      storageDirectory,
      channelName,
    });
    const applyFailureHandler = createFailureHandler(channelName, boundNotify);
    const applyFilter = await createFilter({
      channelName,
      config,
    });
    const applyOfflineFilter = await createOfflineFilter({
      channelName,
    });
    const desktopChannel = applyQueue(
      applyFailureHandler(
        applyFilter(applyOfflineFilter(applyToString(desktopNotify)))
      )
    );
    channels.push(desktopChannel);
  }

  // slack config
  const slackConfig = config.getSlackConfig();
  if (slackConfig?.enabled) {
    const channelName = SlackChannel.channelName;
    const slackNotify = bindNotifier(
      SlackChannel.create(slackConfig),
      SlackChannel.notify
    );
    const applyQueue = createQueue({
      ...queue,
      storageDirectory,
      channelName,
    });
    const applyFailureHandler = createFailureHandler(channelName, boundNotify);
    const applyFilter = await createFilter({
      channelName,
      config,
    });
    const applyOfflineFilter = await createOfflineFilter({
      channelName,
    });
    const slackChannel = applyQueue(
      applyFailureHandler(
        applyFilter(applyOfflineFilter(applyToString(slackNotify)))
      )
    );
    channels.push(slackChannel);
  }

  // telegram config
  const telegramConfig = config.getTelegramConfig();
  if (telegramConfig?.enabled) {
    const channelName = TelegramChannel.channelName;
    const telegramNotify = bindNotifier(
      TelegramChannel.create(telegramConfig, config.setTelegramChatId),
      TelegramChannel.notify
    );
    const applyQueue = createQueue({
      ...queue,
      storageDirectory,
      channelName,
    });
    const applyFailureHandler = createFailureHandler(channelName, boundNotify);
    const applyFilter = await createFilter({
      channelName,
      config,
    });
    const applyOfflineFilter = await createOfflineFilter({
      channelName,
    });
    const telegramChannel = applyQueue(
      applyFailureHandler(
        applyFilter(applyOfflineFilter(applyToString(telegramNotify)))
      )
    );
    channels.push(telegramChannel);
  }

  // endpoint config
  const endpointConfig = config.getEndpointConfig();
  if (endpointConfig?.enabled) {
    const channelName = EndpointChannel.channelName;
    // we don't use bindNotifier and toString like other channels as this channel uses
    // the raw JSON event, not a toString'ed representation
    const endpointNotifier = EndpointChannel.create(endpointConfig);
    const endpointNotify: NotifyEventFunction = (event) =>
      EndpointChannel.notify(endpointNotifier, event);
    const applyQueue = createQueue({
      ...queue,
      storageDirectory,
      channelName,
    });
    const applyFailureHandler = createFailureHandler(channelName, boundNotify);
    const applyFilter = await createFilter({
      channelName,
      config,
    });
    const applyOfflineFilter = await createOfflineFilter({
      channelName,
    });
    const endpointChannel = applyQueue(
      applyFailureHandler(applyFilter(applyOfflineFilter(endpointNotify)))
    );
    channels.push(endpointChannel);
  }

  return notifier;
};

/**
 * Send event to enabled notification channels.
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
