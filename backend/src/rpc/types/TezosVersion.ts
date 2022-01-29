const distributed_db_version = {
  description: "A version number for the distributed DB protocol",
  type: "integer",
  minimum: 0,
  maximum: 65535,
} as const;

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

const distributed_db_version$name = unistring;

const p2p_version = {
  description: "A version number for the p2p layer.",
  type: "integer",
  minimum: 0,
  maximum: 65535,
} as const;

const network_version = {
  description:
    "A version number for the network protocol (includes distributed DB version and p2p version)",
  type: "object",
  properties: {
    chain_name: distributed_db_version$name,
    distributed_db_version: distributed_db_version,
    p2p_version: p2p_version,
  },
  required: ["p2p_version", "distributed_db_version", "chain_name"],
  additionalProperties: false,
} as const;

const schema = {
  $schema: "http://json-schema.org/draft-04/schema#",
  type: "object",
  properties: {
    version: {
      type: "object",
      properties: {
        major: { type: "integer", minimum: -1073741824, maximum: 1073741823 },
        minor: { type: "integer", minimum: -1073741824, maximum: 1073741823 },
        additional_info: {
          oneOf: [
            { title: "Dev", type: "string", enum: ["dev"] },
            {
              title: "RC",
              type: "object",
              properties: {
                rc: {
                  type: "integer",
                  minimum: -1073741824,
                  maximum: 1073741823,
                },
              },
              required: ["rc"],
              additionalProperties: false,
            },
            { title: "Release", type: "string", enum: ["release"] },
          ],
        },
      },
      required: ["additional_info", "minor", "major"],
      additionalProperties: false,
    },
    network_version: network_version,
    commit_info: {
      oneOf: [
        {
          title: "Some",
          type: "object",
          properties: { commit_hash: unistring, commit_date: unistring },
          required: ["commit_date", "commit_hash"],
          additionalProperties: false,
        },
        { title: "None", type: "null" },
      ],
    },
  },
  required: ["commit_info", "network_version", "version"],
  additionalProperties: false,
} as const;

import { FromSchema } from "json-schema-to-ts";
type T = FromSchema<typeof schema>;
export default T;
