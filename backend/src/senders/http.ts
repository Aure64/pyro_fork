import { Server } from "net";
import { createServer } from "http";
import { getLogger } from "loglevel";
import { Events, Event, Sender } from "../events";
import { fetchTimeout } from "../rpc/util";

export type WebhookConfig = {
  enabled: boolean;
  url: string;
  user_agent: string;
  test_endpoint_port: number | undefined;
  exclude: Events[];
  request_timeout: number;
};

export const startTestEndpoint = (port: number): Server => {
  const log = getLogger("webhook-test");
  const server = createServer((req, res) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      log.info(req.headers);
      log.info(JSON.parse(data));
      res.end();
    });
  });
  return server.listen(port);
};

export const create = (config: WebhookConfig): Sender => {
  if (config.test_endpoint_port) {
    startTestEndpoint(config.test_endpoint_port);
  }
  const requestTimeout = config.request_timeout * 1e3;
  const log = getLogger("http-sender");
  return async (events: Event[]) => {
    const url = config.url;
    const method = "POST";
    const body = JSON.stringify(events);
    const headers = {
      "Content-Type": "application/json",
      "User-Agent": config.user_agent,
    };
    const result = await fetchTimeout(url, requestTimeout, {
      body,
      method,
      headers,
    });
    if (!result.ok) {
      log.error(result);
      throw new Error(result.statusText);
    }
  };
};
