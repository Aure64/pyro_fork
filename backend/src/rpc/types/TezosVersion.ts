import distributed_db_version from "./defs/distributed_db_version";

import unistring from "./defs/unistring";

import distributed_db_version$name from "./defs/distributed_db_version$name";

import p2p_version from "./defs/p2p_version";

import network_version from "./defs/network_version";

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
