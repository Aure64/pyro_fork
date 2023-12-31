import { join } from "path";

import express from "express";
import { graphqlHTTP } from "express-graphql";
import { schema } from "./schema";
import { createContext } from "./context";

import morgan from "morgan";
import cors from "cors";

import { getLogger } from "loglevel";

import { NodeInfoCollection } from "../nodeMonitor";
import { BakerInfoCollection } from "bakerMonitor";
import { RpcClientConfig } from "rpc/client";

export const app = express();

const logFormat = process.env.NODE_ENV === "development" ? "dev" : "combined";

app.use(
  morgan(
    logFormat,
    process.env.NODE_ENV === "development"
      ? undefined
      : {
          skip: function (_req, res) {
            return res.statusCode < 400;
          },
        }
  )
);
app.use(cors());

const rootValue = {
  hello: () => {
    return "Hello world!";
  },
};

type URL = string;

export type UIConfig = {
  enabled: boolean;
  host: string;
  port: number;
  explorer_url?: string;
  webroot?: string;
  show_system_info?: boolean;
};

export const start = (
  nodeMonitor: NodeInfoCollection | null,
  bakerMonitor: BakerInfoCollection | null,
  rpc: URL,
  {
    host,
    port,
    explorer_url,
    webroot: configuredWebroot,
    show_system_info,
  }: UIConfig,
  rpcConfig: RpcClientConfig
) => {
  console.error("show_system_info", show_system_info);

  const webroot = configuredWebroot || join(__dirname, "../../ui");
  getLogger("api").info(`Serving web UI assets from ${webroot}`);
  app.use(express.static(webroot));

  app.use(
    "/gql",
    graphqlHTTP({
      schema,
      rootValue,
      graphiql: true,
      context: createContext(
        nodeMonitor || { info: async () => [] },
        bakerMonitor || {
          info: async () => {
            return {
              bakerInfo: [],
              headDistance: 0,
              blocksPerCycle: 0,
              atRiskThreshold: 1,
            };
          },
        },
        rpc,
        rpcConfig,
        explorer_url,
        show_system_info
      ),
    })
  );

  return app.listen(port, host, () => {
    const logger = getLogger("api");
    logger.info(`Server started on ${host}:${port}`);
  });
};
