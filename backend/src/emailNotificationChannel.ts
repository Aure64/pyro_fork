import { createTransport, Transporter } from "nodemailer";
import { Notify } from "./types";

export const channelName = "email";

type Protocol = "Plain" | "SSL" | "STARTTLS";

export type EmailConfig = {
  enabled: boolean;
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
  try {
    transporter.sendMail({
      from: `Pyrometer ${config.email}`,
      to: config.email,
      subject: title,
      text: message,
    });
    return { kind: "SUCCESS" };
  } catch (error) {
    return { kind: "ERROR", error, channelName };
  }
};
