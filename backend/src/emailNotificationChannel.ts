import { createTransport, Transporter } from "nodemailer";
import { Notify } from "./types";
import to from "await-to-js";

export const channelName = "email";

type Protocol = "Plain" | "SSL" | "STARTTLS";

export type EmailConfig = {
  host: string;
  port: number;
  protocol: Protocol;
  username: string | undefined;
  password: string | undefined;
  email: string;
};

export type EmailNotificationChannel = {
  config: EmailConfig;
  transporter: Transporter;
};

export const create = (config: EmailConfig): EmailNotificationChannel => {
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
  { message, title }
) => {
  const { transporter, config } = notifier;
  const [error] = await to(
    transporter.sendMail({
      from: `Kiln ${config.email}`,
      to: config.email,
      subject: title,
      text: message,
    })
  );
  if (error) {
    return { kind: "ERROR", error, channelName };
  } else {
    return { kind: "SUCCESS" };
  }
};
