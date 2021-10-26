import express from "express";
import { graphqlHTTP } from "express-graphql";
import { schema } from "./schema";
import { createContext } from "./context";

import morgan from "morgan";
import cors from "cors";

import { getLogger } from "loglevel";

import { NodeInfoCollection } from "../nodeMonitor";
import { BakerInfoCollection } from "bakerMonitor";

export const app = express();

const logFormat = "dev";
// const logFormat = "combined";

app.use(morgan(logFormat));
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
};

export const start = (
  nodeMonitor: NodeInfoCollection | null,
  bakerMonitor: BakerInfoCollection | null,
  rpc: URL,
  { host, port, explorer_url }: UIConfig
) => {
  app.use(
    "/gql",
    graphqlHTTP(async () => ({
      schema,
      rootValue,
      graphiql: true,
      context: createContext(
        nodeMonitor || { info: async () => [] },
        bakerMonitor || {
          info: async () => {
            return { bakerInfo: [] };
          },
        },
        rpc,
        explorer_url
      ),
      customFormatErrorFn: (error) => {
        const params = {
          message: error.message,
          locations: error.locations,
          stack: error.stack,
        };
        console.error(params);
        return params;
      },
    }))
  );

  return app.listen(port, host, () => {
    const logger = getLogger("api");
    logger.log(`Server started on ${host}:${port}`);
  });
};
