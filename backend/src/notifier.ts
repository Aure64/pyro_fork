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
import { create as createVerifier } from "./notifierMiddleware/verifier";
import { trace } from "loglevel";
import { Config } from "./config";
import { compose } from "ramda";

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

  const emailChannel = await configureEmailChannel(config, boundNotify);
  if (emailChannel) channels.push(emailChannel);

  const desktopChannel = await configureDesktopChannel(config, boundNotify);
  if (desktopChannel) channels.push(desktopChannel);

  const slackChannel = await configureSlackChannel(config, boundNotify);
  if (slackChannel) channels.push(slackChannel);

  const telegramChannel = await configureTelegramChannel(config, boundNotify);
  if (telegramChannel) channels.push(telegramChannel);

  const endpointChannel = await configureEndpointChannel(config, boundNotify);
  if (endpointChannel) channels.push(endpointChannel);

  return notifier;
};

const configureEmailChannel = async (
  config: Config,
  notify: (event: TezosNodeEvent | NotifierEvent) => void
): Promise<NotifyEventFunction | null> => {
  const queue = config.getQueueConfig();
  const storageDirectory = config.storageDirectory;

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
    const applyFailureHandler = createFailureHandler(channelName, notify);
    const applyFilter = await createFilter({
      channelName,
      config,
    });
    const applyOfflineFilter = await createOfflineFilter({
      channelName,
    });
    const applyVerifier = createVerifier(channelName, config);
    const apply = compose(
      applyQueue,
      applyFailureHandler,
      applyFilter,
      applyOfflineFilter,
      applyVerifier,
      applyToString
    );
    return apply(emailNotify);
  }
  return null;
};

const configureDesktopChannel = async (
  config: Config,
  notify: (event: TezosNodeEvent | NotifierEvent) => void
): Promise<NotifyEventFunction | null> => {
  const queue = config.getQueueConfig();
  const storageDirectory = config.storageDirectory;

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
    const applyFailureHandler = createFailureHandler(channelName, notify);
    const applyFilter = await createFilter({
      channelName,
      config,
    });
    const applyOfflineFilter = await createOfflineFilter({
      channelName,
    });
    const applyVerifier = createVerifier(channelName, config);

    const apply = compose(
      applyQueue,
      applyFailureHandler,
      applyFilter,
      applyOfflineFilter,
      applyVerifier,
      applyToString
    );
    return apply(desktopNotify);
  }

  return null;
};

const configureSlackChannel = async (
  config: Config,
  notify: (event: TezosNodeEvent | NotifierEvent) => void
): Promise<NotifyEventFunction | null> => {
  const queue = config.getQueueConfig();
  const storageDirectory = config.storageDirectory;

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
    const applyFailureHandler = createFailureHandler(channelName, notify);
    const applyFilter = await createFilter({
      channelName,
      config,
    });
    const applyOfflineFilter = await createOfflineFilter({
      channelName,
    });
    const applyVerifier = createVerifier(channelName, config);

    const apply = compose(
      applyQueue,
      applyFailureHandler,
      applyFilter,
      applyOfflineFilter,
      applyVerifier,
      applyToString
    );
    return apply(slackNotify);
  }

  return null;
};

const configureTelegramChannel = async (
  config: Config,
  notify: (event: TezosNodeEvent | NotifierEvent) => void
): Promise<NotifyEventFunction | null> => {
  const queue = config.getQueueConfig();
  const storageDirectory = config.storageDirectory;

  const telegramConfig = config.getTelegramConfig();
  if (telegramConfig?.enabled) {
    const channelName = TelegramChannel.channelName;
    const telegramNotify = bindNotifier(
      await TelegramChannel.create(telegramConfig, config.setTelegramChatId),
      TelegramChannel.notify
    );
    const applyQueue = createQueue({
      ...queue,
      storageDirectory,
      channelName,
    });
    const applyFailureHandler = createFailureHandler(channelName, notify);
    const applyFilter = await createFilter({
      channelName,
      config,
    });
    const applyOfflineFilter = await createOfflineFilter({
      channelName,
    });
    const applyVerifier = createVerifier(channelName, config);

    const apply = compose(
      applyQueue,
      applyFailureHandler,
      applyFilter,
      applyOfflineFilter,
      applyVerifier,
      applyToString
    );
    return apply(telegramNotify);
  }

  return null;
};

const configureEndpointChannel = async (
  config: Config,
  notify: (event: TezosNodeEvent | NotifierEvent) => void
): Promise<NotifyEventFunction | null> => {
  const queue = config.getQueueConfig();
  const storageDirectory = config.storageDirectory;

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
    const applyFailureHandler = createFailureHandler(channelName, notify);
    const applyFilter = await createFilter({
      channelName,
      config,
    });
    const applyOfflineFilter = await createOfflineFilter({
      channelName,
    });
    const applyVerifier = createVerifier(channelName, config);

    const apply = compose(
      applyQueue,
      applyFailureHandler,
      applyFilter,
      applyOfflineFilter,
      applyVerifier
    );
    return apply(endpointNotify);
  }

  return null;
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
