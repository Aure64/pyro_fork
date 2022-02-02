import unistring from "./unistring";

import distributed_db_version from "./distributed_db_version";

import distributed_db_version$name from "./distributed_db_version$name";

import p2p_version from "./p2p_version";

import network_version from "./network_version";

import p2p_address from "./p2p_address";

import p2p_connection$id from "./p2p_connection$id";

import Crypto_box$Public_key_hash from "./Crypto_box$Public_key_hash";

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
export type Item = T[number];
export default T;
