import { mocked } from "ts-jest/utils";
import { notify, Config } from "./emailNotifier";
import { Transporter } from "nodemailer";

const config: Config = {
  host: "localhost",
  port: 367,
  username: "admin",
  password: "secret123",
  protocol: "Plain",
  email: "admin@example.com",
};

describe("notify", () => {
  test("sends email notification", () => {
    const transporter: Transporter = ({
      sendMail: jest.fn().mockResolvedValue({ messageId: 12 }),
    } as unknown) as Transporter;
    const notifier = { config, transporter };
    const mockedTransporter = mocked(transporter);

    notify(notifier, { kind: "some kind", message: "some error message" });
    expect(mockedTransporter.sendMail.mock.calls.length).toBe(1);
    expect(mockedTransporter.sendMail.mock.calls[0][0]).toEqual({
      text: "some error message",
      subject: "Kiln Event: some kind",
      to: "admin@example.com",
      from: "admin@example.com",
    });
  });

  test("resolves to success string when successful", () => {
    const transporter: Transporter = ({
      sendMail: jest.fn().mockResolvedValue({ messageId: 12 }),
    } as unknown) as Transporter;
    const notifier = { config, transporter };

    const result = notify(notifier, {
      kind: "some kind",
      message: "some error message",
    });
    return expect(result).resolves.toBe("success");
  });

  test("resolves to error object when unsuccessful", () => {
    const error = new Error("error showing notification");
    const transporter: Transporter = ({
      sendMail: jest.fn().mockRejectedValue(error),
    } as unknown) as Transporter;
    const notifier = { config, transporter };

    const result = notify(notifier, {
      kind: "some kind",
      message: "some error message",
    });
    return expect(result).resolves.toEqual({ error });
  });
});
