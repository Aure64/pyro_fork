import { createTransport, Transporter } from "nodemailer";
import { Notify } from "./types";
import to from "await-to-js";

type Protocol = "Plain" | "SSL" | "STARTTLS";

export type Config = {
  host: string;
  port: number;
  protocol: Protocol;
  username: string | undefined;
  password: string | undefined;
  email: string;
};

export type EmailNotificationChannel = {
  config: Config;
  transporter: Transporter;
};

export const create = (config: Config): EmailNotificationChannel => {
  const transporter = createTransport({
    host: config.host,
    port: config.port,
    secure: false,
    auth: {
      user: config.username,
      pass: config.password,
    },
  });
  return { config, transporter };
};

export const notify: Notify<EmailNotificationChannel> = async (
  notifier,
  message
) => {
  const { transporter, config } = notifier;
  const [error] = await to(
    transporter.sendMail({
      from: config.email,
      to: config.email,
      subject: "Kiln Event",
      text: message,
    })
  );
  if (error) {
    return { kind: "ERROR", error };
  } else {
    return { kind: "SUCCESS" };
  }
};
