import * as TelegramBot from "node-telegram-bot-api";
import { Notify } from "./types";
import { debug } from "loglevel";

export const channelName = "telegram";

export type TelegramConfig = {
  chatId: number | undefined;
  enabled: boolean;
  token: string;
};

export type TelegramNotificationChannel = {
  bot: TelegramBot;
  chatId: number | undefined;
};

export const create = async (
  config: TelegramConfig,
  saveChatId: (chatId: number) => void
): Promise<TelegramNotificationChannel> => {
  const bot = new TelegramBot(config.token);
  const channel = { bot, chatId: config.chatId };
  if (!config.chatId) {
    debug(`No Telegram chatId found in config, attempting to fetch...`);
    try {
      const chatId = await listenForChatId(config.token);
      saveChatId(chatId);
      channel.chatId = chatId;
      debug(`Telegram chatId loaded and saved to system: ${chatId}`);
    } catch (err) {
      debug(`Unable to fetch Telegram chatId for token ${config.token}`);
    }
  }
  return channel;
};

export const notify: Notify<TelegramNotificationChannel> = async (
  notifier,
  { message, title }
) => {
  if (!notifier.chatId) {
    const error = new Error("Telegram notification channel is missing chatId");
    return { kind: "ERROR", error, channelName };
  }
  try {
    await notifier.bot.sendMessage(notifier.chatId, `${title}\n${message}`);
    return { kind: "SUCCESS" };
  } catch (error) {
    return { kind: "ERROR", error, channelName };
  }
};

/**
 * Fetch chatId for the given token. Telegram expires updates after 24 hours, so the chat must
 * have had activity during this time to succeed.
 * Times out with a failkure after 20 seconds.
 */
export const listenForChatId = async (token: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const bot = new TelegramBot(token, { polling: true });

    // if polling doesn't find a chatId within 5 seconds, fail
    const timeout = setTimeout(() => {
      bot.stopPolling();
      reject(new Error("No telegram messages received for provided token."));
    }, 20000);

    bot.on("message", (message) => {
      bot.stopPolling();
      const chatId = message.chat.id;
      clearTimeout(timeout);
      resolve(chatId);
    });
  });
};
