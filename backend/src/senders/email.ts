import { debug } from "loglevel";
import { createTransport } from "nodemailer";

import { TezosNodeEvent, Sender } from "../types";

import format from "../format";

export type Protocol = "Plain" | "SSL" | "STARTTLS";

export type EmailConfig = {
  enabled: boolean;
  host: string;
  port: number;
  protocol: Protocol;
  username: string | undefined;
  password: string | undefined;
  email: string;
};

export const create = (config: EmailConfig): Sender => {
  const transporter = createTransport({
    host: config.host,
    port: config.port,
    secure: false,
    auth: {
      user: config.username,
      pass: config.password,
    },
  });

  return async (events: TezosNodeEvent[]) => {
    debug(`About to send email for ${events.length} events`, events);
    if (events.length === 0) {
      return Promise.resolve();
    }

    let subject = `${events.length} events`;
    let text = format(events);

    if (events.length === 1) {
      subject = text;
      text = "";
    }

    const result = await transporter.sendMail({
      from: `Pyrometer ${config.email}`,
      to: config.email,
      subject,
      text: format(events),
    });
    debug("Sent email", result);
    return Promise.resolve();
  };
};
