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

const distributed_db_version = {
  description: "A version number for the distributed DB protocol",
  type: "integer",
  minimum: 0,
  maximum: 65535,
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

const p2p_address = unistring;

const p2p_connection$id = {
  description:
    "The identifier for a p2p connection. It includes an address and a port number.",
  type: "object",
  properties: {
    addr: p2p_address,
    port: { type: "integer", minimum: 0, maximum: 65535 },
  },
  required: ["addr"],
  additionalProperties: false,
} as const;

const Crypto_box$Public_key_hash = unistring;

const schema = {
  $schema: "http://json-schema.org/draft-04/schema#",
  type: "array",
  items: {
    type: "object",
    properties: {
      incoming: { type: "boolean" },
      peer_id: Crypto_box$Public_key_hash,
      id_point: p2p_connection$id,
      remote_socket_port: { type: "integer", minimum: 0, maximum: 65535 },
      announced_version: network_version,
      private: { type: "boolean" },
      local_metadata: {
        type: "object",
        properties: {
          disable_mempool: { type: "boolean" },
          private_node: { type: "boolean" },
        },
        required: ["private_node", "disable_mempool"],
        additionalProperties: false,
      },
      remote_metadata: {
        type: "object",
        properties: {
          disable_mempool: { type: "boolean" },
          private_node: { type: "boolean" },
        },
        required: ["private_node", "disable_mempool"],
        additionalProperties: false,
      },
    },
    required: [
      "remote_metadata",
      "local_metadata",
      "private",
      "announced_version",
      "remote_socket_port",
      "id_point",
      "peer_id",
      "incoming",
    ],
    additionalProperties: false,
  },
} as const;

import { FromSchema } from "json-schema-to-ts";
type T = FromSchema<typeof schema>;
export default T;
