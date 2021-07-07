import { Server } from "net";
import fetch from "cross-fetch";
import { createServer } from "http";
import { getLogger } from "loglevel";
import { Event, Sender } from "../types2";

export type EndpointConfig = {
  enabled: boolean;
  url: string;
};

export const startDummyHttpServer = (port = 8005): Server => {
  const log = getLogger("dummy-http-server");
  const server = createServer((req, res) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      log.info(JSON.parse(data));
      res.end();
    });
  });
  return server.listen(port);
};

export const create = (config: EndpointConfig): Sender => {
  startDummyHttpServer();
  const log = getLogger("http-sender");
  return async (events: Event[]) => {
    const url = config.url;
    const method = "POST";
    const body = JSON.stringify(events);
    const result = await fetch(url, { body, method });
    if (!result.ok) {
      log.error(result);
      throw new Error(result.statusText);
    }
  };
};
