import unistring from "./unistring";

import Signature$Public_key_hash from "./Signature$Public_key_hash";

import timestamp$protocol from "./timestamp$protocol";

const schema = {
  $schema: "http://json-schema.org/draft-04/schema#",
  type: "array",
  items: {
    type: "object",
    properties: {
      level: { type: "integer", minimum: -2147483648, maximum: 2147483647 },
      delegate: Signature$Public_key_hash,
      slots: {
        type: "array",
        items: { type: "integer", minimum: 0, maximum: 65535 },
      },
      estimated_time: timestamp$protocol,
    },
    required: ["slots", "delegate", "level"],
    additionalProperties: false,
  },
} as const;

import { FromSchema } from "json-schema-to-ts";
type T = FromSchema<typeof schema>;
export type Item = T[number];
export default T;
