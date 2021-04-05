import { Result } from "./types";
import * as TelegramBot from "node-telegram-bot-api";
import { Notify } from "./types";

export const channelName = "telegram";

export type TelegramConfig = {
  token: string;
  chatId: number;
};

export type TelegramNotificationChannel = {
  bot: TelegramBot;
  chatId: number;
};

export const create = (config: TelegramConfig): TelegramNotificationChannel => {
  const bot = new TelegramBot(config.token);
  return { bot, chatId: config.chatId };
};

export const notify: Notify<TelegramNotificationChannel> = async (
  notifier,
  { message, title }
) => {
  try {
    await notifier.bot.sendMessage(notifier.chatId, `${title}\n${message}`);
    return { kind: "SUCCESS" };
  } catch (error) {
    return { kind: "ERROR", error, channelName };
  }
};

/**
 * Fetch chatId for the given token. While listening, a message should be sent to the Telegram bot.
 * Times out with a failkure after 20 seconds.
 */
export const listenForChatId = async (
  token: string
): Promise<Result<number>> => {
  return new Promise((resolve) => {
    const bot = new TelegramBot(token, { polling: true });

    // if polling doesn't find a chatId within 5 seconds, fail
    const timeout = setTimeout(() => {
      bot.stopPolling();
      resolve({
        type: "ERROR",
        message: "No telegram messages received for provided token.",
      });
    }, 20000);

    bot.on("message", (message) => {
      bot.stopPolling();
      const chatId = message.chat.id;
      clearTimeout(timeout);
      resolve({ type: "SUCCESS", data: chatId });
    });
  });
};
