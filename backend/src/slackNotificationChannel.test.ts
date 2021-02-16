import { IncomingWebhook } from "@slack/webhook";
import { notify } from "./slackNotificationChannel";

const send = jest.fn();

const notifier = {
  webhook: ({ send } as unknown) as IncomingWebhook,
};

describe("notify", () => {
  test("sends slack notification", () => {
    notify(notifier, "some error message");
    expect(send.mock.calls.length).toBe(1);
    expect(send.mock.calls[0][0]).toEqual("some error message");
  });

  test("resolves to success string when successful", () => {
    send.mockResolvedValue(true);

    const result = notify(notifier, "some error message");
    return expect(result).resolves.toEqual({ kind: "SUCCESS" });
  });

  test("resolves to error object when unsuccessful", () => {
    const error = new Error("error showing notification");
    send.mockRejectedValue(error);
    const result = notify(notifier, "some error message");
    return expect(result).resolves.toEqual({ kind: "ERROR", error });
  });
});
