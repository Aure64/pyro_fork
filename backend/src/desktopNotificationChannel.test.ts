import { mocked } from "ts-jest/utils";
import { notify as desktopNotify, NodeNotifier } from "node-notifier";
import { notify } from "./desktopNotificationChannel";

jest.mock("node-notifier", () => ({
  notify: jest.fn(),
}));

const mockedNotifier = mocked(desktopNotify, true);

const notifier = {
  config: { enabled: true, enableSound: false },
};

describe("notify", () => {
  test("sends desktop notification", () => {
    notify(notifier, "some error message");
    expect(mockedNotifier.mock.calls.length).toBe(1);
    expect(mockedNotifier.mock.calls[0][0]).toEqual({
      message: "some error message",
      title: "Kiln Event",
      sound: false,
    });
  });

  test("resolves to success string when successful", () => {
    mockedNotifier.mockImplementation((_args, callback) => {
      callback?.(null, "");
      return {} as NodeNotifier;
    });

    const result = notify(notifier, "some error message");
    return expect(result).resolves.toEqual({ kind: "SUCCESS" });
  });

  test("resolves to error object when unsuccessful", () => {
    const error = new Error("error showing notification");
    mockedNotifier.mockImplementation((_args, callback) => {
      callback?.(error, "");
      return {} as NodeNotifier;
    });
    const result = notify(notifier, "some error message");
    return expect(result).resolves.toEqual({
      kind: "ERROR",
      error,
      channelName: "desktop",
    });
  });
});
