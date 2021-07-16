import * as TelegramBot from "node-telegram-bot-api";
import { getLogger } from "loglevel";
import { Event, Sender } from "../types2";
import format from "../format2";
import { delay } from "../delay";

import { open as openStorage } from "../storage";

const LOGGER_NAME = "telegram-sender";

export type TelegramConfig = {
  enabled: boolean;
  token: string;
  emoji: boolean;
};

const MAX_MESSAGE_LENGTH = 4096;

/**
 * Fetch chatId for the given token. Telegram expires updates after 24 hours, so the chat must
 * have had activity during this time to succeed.
 * Times out with a failure after 20 seconds.
 */

const listenForChatId = async (token: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const bot = new TelegramBot(token, { polling: true });

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

export const create = async (
  config: TelegramConfig,
  storageDir: string
): Promise<Sender> => {
  const log = getLogger(LOGGER_NAME);
  const bot = new TelegramBot(config.token);

  const store = await openStorage([storageDir, "telegram"]);

  const CHAT_ID_KEY = "chat-id";
  const getChatId = async () => (await store.get(CHAT_ID_KEY)) as number;
  const setChatId = async (value: number) =>
    await store.put(CHAT_ID_KEY, value);

  let chatId = await getChatId();

  log.info(`Telegram chat id: ${chatId}`);

  if (!chatId) {
    log.info(`No Telegram chat id , attempting to fetch...`);
    log.info(`Send any message to your bot in Telegram`);
    try {
      chatId = await listenForChatId(config.token);
      setChatId(chatId);
      log.info(`Fetched Telegram chat id: ${chatId}`);
    } catch (err) {
      log.error(
        `Unable to fetch Telegram chatId for token ${config.token}`,
        err
      );
    }
  }

  return async (events: Event[]) => {
    if (!chatId) {
      throw new Error("Telegram notification channel is missing chatId");
    }
    const lines = format(events, config.emoji);
    let message = "";
    let count = 0;
    for (const line of lines) {
      if (message.length + line.length + 1 < MAX_MESSAGE_LENGTH) {
        message += line + "\n";
      } else {
        count += 1;
        log.debug(
          `Sending message ${count} of length ${message.length}`,
          message
        );
        await bot.sendMessage(chatId, message);
        message = line + "\n";
        await delay(1000);
      }
    }
    if (message.length > 0) {
      count += 1;
      log.debug(
        `Sending message ${count} of length ${message.length}`,
        message
      );
      await bot.sendMessage(chatId, message);
    }
  };
};
