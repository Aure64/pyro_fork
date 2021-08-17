import { getLogger } from "loglevel";
import { createTransport } from "nodemailer";

import { Event, Sender } from "../events";

import { email as formatEmail } from "../format";

export type Protocol = "PLAIN" | "SSL" | "STARTTLS";

export type EmailConfig = {
  enabled: boolean;
  host: string;
  port: number;
  protocol: Protocol;
  username: string | undefined;
  password: string | undefined;
  to: string | string[];
  from?: string;
  emoji: boolean;
  short_address: boolean;
};

export const create = (config: EmailConfig): Sender => {
  //From https://nodemailer.com/smtp/#tls-options:
  // * secure – if true the connection will use TLS when connecting to
  //   server. If false (the default) then TLS is used if server
  //   supports the STARTTLS extension. In most cases set this value
  //   to true if you are connecting to port 465. For port 587 or 25
  //   keep it false
  // * requireTLS – if this is true and secure is false then Nodemailer
  //   tries to use STARTTLS even if the server does not advertise
  //   support for it. If the connection can not be encrypted then
  //   message is not sent
  const secure = config.protocol === "SSL" ? true : false;
  const requireTLS = config.protocol === "STARTTLS" ? true : false;
  const transporter = createTransport({
    host: config.host,
    port: config.port,
    secure,
    requireTLS,
    auth: {
      user: config.username,
      pass: config.password,
    },
  });

  const log = getLogger("email-sender");

  return async (events: Event[]) => {
    log.debug(`About to send email for ${events.length} events`, events);

    const [subject, text] = formatEmail(
      events,
      config.emoji,
      config.short_address
    );

    const fromAddr =
      config.from || (Array.isArray(config.to) ? config.to[0] : config.to);
    const result = await transporter.sendMail({
      from: fromAddr,
      to: config.to,
      subject,
      text,
    });
    log.debug("Sent email", result);
    return Promise.resolve();
  };
};
