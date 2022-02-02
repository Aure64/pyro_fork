import chain_status from "./chain_status";

import unistring from "./unistring";

const schema = {
  $schema: "http://json-schema.org/draft-04/schema#",
  type: "object",
  properties: { bootstrapped: { type: "boolean" }, sync_state: chain_status },
  required: ["sync_state", "bootstrapped"],
  additionalProperties: false,
} as const;

import { FromSchema } from "json-schema-to-ts";
type T = FromSchema<typeof schema>;
export default T;
