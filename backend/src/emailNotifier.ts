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

type EmailNotifier = {
  config: Config;
  transporter: Transporter;
};

export const create = (config: Config): EmailNotifier => {
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

export const notify: Notify<EmailNotifier> = async (notifier, event) => {
  const { transporter, config } = notifier;
  const [error] = await to(
    transporter.sendMail({
      from: config.email,
      to: config.email,
      subject: `Kiln Event: ${event.kind}`,
      text: event.message,
    })
  );
  if (error) {
    return { kind: "error", error };
  } else {
    return { kind: "success" };
  }
};
