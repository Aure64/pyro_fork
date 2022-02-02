import Chain_id from "./Chain_id";
import block_hash from "./block_hash";
import timestamp$protocol from "./timestamp$protocol";
import Operation_list_list_hash from "./Operation_list_list_hash";
import fitness from "./fitness";
import Context_hash from "./Context_hash";
import value_hash from "./value_hash";
import cycle_nonce from "./cycle_nonce";
import Signature from "./Signature";

const block_header = {
  title: "Shell header",
  description:
    "Block header's shell-related content. It contains information such as the block level, its predecessor and timestamp.",
  type: "object",
  properties: {
    protocol: {
      type: "string",
      enum: ["Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A"],
    },
    chain_id: Chain_id,
    hash: block_hash,
    level: { type: "integer", minimum: -2147483648, maximum: 2147483647 },
    proto: { type: "integer", minimum: 0, maximum: 255 },
    predecessor: block_hash,
    timestamp: timestamp$protocol,
    validation_pass: { type: "integer", minimum: 0, maximum: 255 },
    operations_hash: Operation_list_list_hash,
    fitness: fitness,
    context: Context_hash,
    payload_hash: value_hash,
    payload_round: {
      type: "integer",
      minimum: -2147483648,
      maximum: 2147483647,
    },
    proof_of_work_nonce: {
      type: "string",
      pattern: "^([a-zA-Z0-9][a-zA-Z0-9])*$",
    },
    seed_nonce_hash: cycle_nonce,
    liquidity_baking_escape_vote: { type: "boolean" },
    signature: Signature,
  },
  required: [
    "signature",
    "liquidity_baking_escape_vote",
    "proof_of_work_nonce",
    "payload_round",
    "payload_hash",
    "context",
    "fitness",
    "operations_hash",
    "validation_pass",
    "timestamp",
    "predecessor",
    "proto",
    "level",
    "hash",
    "chain_id",
    "protocol",
  ],
  additionalProperties: false,
} as const;
export default block_header;
