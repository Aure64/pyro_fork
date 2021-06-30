import { getLogger } from "loglevel";
import { createTransport } from "nodemailer";

import { Event, Sender } from "../types2";

import { email as formatEmail } from "../format2";

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

  const log = getLogger("email-sender");

  return async (events: Event[]) => {
    log.debug(`About to send email for ${events.length} events`, events);

    const [subject, text] = formatEmail(events);

    const result = await transporter.sendMail({
      from: `Pyrometer ${config.email}`,
      to: config.email,
      subject,
      text,
    });
    log.debug("Sent email", result);
    return Promise.resolve();
  };
};
