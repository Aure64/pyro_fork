import express from "express";
import { graphqlHTTP } from "express-graphql";
import { schema } from "./schema";
import { createContext } from "./context";

import morgan from "morgan";
import cors from "cors";

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

const emptyInfoCollection = { info: async () => [] };

export const start = (
  nodeMonitor: NodeInfoCollection | null,
  bakerMonitor: BakerInfoCollection | null,
  rpc: URL,
  port = 4000
) => {
  app.use(
    "/gql",
    graphqlHTTP(async () => ({
      schema,
      rootValue,
      graphiql: true,
      context: createContext(
        nodeMonitor || emptyInfoCollection,
        bakerMonitor || emptyInfoCollection,
        rpc
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

  return app.listen(port, () => console.log(`Server started on port ${port}`));
};
