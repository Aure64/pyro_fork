import * as TelegramBot from "node-telegram-bot-api";
import {
  notify,
  TelegramNotificationChannel,
} from "./telegramNotificationChannel";

const sendMessage = jest.fn();

const notifier: TelegramNotificationChannel = {
  bot: { sendMessage } as unknown as TelegramBot,
  chatId: 12,
};

describe("notify", () => {
  test("sends telegram notification", () => {
    notify(notifier, { title: "some title", message: "some error message" });
    expect(sendMessage.mock.calls.length).toBe(1);
    expect(sendMessage.mock.calls[0]).toEqual([
      12,
      "some title\nsome error message",
    ]);
  });

  test("resolves to success string when successful", () => {
    sendMessage.mockResolvedValue(true);

    const result = notify(notifier, {
      title: "some title",
      message: "some error message",
    });
    return expect(result).resolves.toEqual({ kind: "SUCCESS" });
  });

  test("resolves to error object when unsuccessful", () => {
    const error = new Error("error showing notification");
    sendMessage.mockRejectedValue(error);
    const result = notify(notifier, {
      title: "some title",
      message: "some error message",
    });
    return expect(result).resolves.toEqual({
      kind: "ERROR",
      error,
      channelName: "telegram",
    });
  });
});
