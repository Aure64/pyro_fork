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
      delegates: {
        type: "array",
        items: {
          type: "object",
          properties: {
            delegate: Signature$Public_key_hash,
            first_slot: { type: "integer", minimum: 0, maximum: 65535 },
            endorsing_power: { type: "integer", minimum: 0, maximum: 65535 },
          },
          required: ["endorsing_power", "first_slot", "delegate"],
          additionalProperties: false,
        },
      },
      estimated_time: timestamp$protocol,
    },
    required: ["delegates", "level"],
    additionalProperties: false,
  },
} as const;

import { FromSchema } from "json-schema-to-ts";
type T = FromSchema<typeof schema>;
export type Item = T[number];
export default T;
