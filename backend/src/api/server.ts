import express from "express";
import { graphqlHTTP } from "express-graphql";
import { schema } from "./schema";
import { createContext } from "./context";

import morgan from "morgan";
import cors from "cors";

import { NodeInfoCollection } from "../nodeMonitor";

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

//FIXME figure out types
export const start = (nodeMonitor: NodeInfoCollection | null, port = 4000) => {
  app.use(
    "/gql",
    graphqlHTTP(async (request) => ({
      schema,
      rootValue,
      graphiql: true,
      context: createContext(nodeMonitor || { info: () => [] }),
      customFormatErrorFn: (error) => {
        const params = {
          message: error.message,
          locations: error.locations,
          stack: error.stack,
        };
        console.error(params);
        // Optional ${request.body.operationName} ${request.body.variables}
        return params;
      },
    }))
  );

  app.listen(port, () => console.log(`Server started on port ${port}`));
};
