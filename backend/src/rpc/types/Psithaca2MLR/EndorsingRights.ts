const unistring = {
  title: "Universal string representation",
  description:
    "Either a plain UTF8 string, or a sequence of bytes for strings that contain invalid byte sequences.",
  oneOf: [
    { type: "string" },
    {
      type: "object",
      properties: {
        invalid_utf8_string: {
          type: "array",
          items: { type: "integer", minimum: 0, maximum: 255 },
        },
      },
      required: ["invalid_utf8_string"],
      additionalProperties: false,
    },
  ],
} as const;

const Signature$Public_key_hash = unistring;

const timestamp$protocol = unistring;

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
export default T;
