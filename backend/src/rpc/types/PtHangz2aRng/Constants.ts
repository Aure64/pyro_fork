const positive_bignum = {
  title: "Positive big number",
  description: "Decimal representation of a positive big number",
  type: "string",
} as const;

const bignum = {
  title: "Big number",
  description: "Decimal representation of a big number",
  type: "string",
} as const;

const int64 = {
  title: "64 bit integers",
  description: "Decimal representation of 64 bit integers",
  type: "string",
} as const;

const _011_PtHangz2$mutez = positive_bignum;

const schema = {
  $schema: "http://json-schema.org/draft-04/schema#",
  type: "object",
  properties: {
    proof_of_work_nonce_size: { type: "integer", minimum: 0, maximum: 255 },
    nonce_length: { type: "integer", minimum: 0, maximum: 255 },
    max_anon_ops_per_block: { type: "integer", minimum: 0, maximum: 255 },
    max_operation_data_length: {
      type: "integer",
      minimum: -1073741824,
      maximum: 1073741823,
    },
    max_proposals_per_delegate: { type: "integer", minimum: 0, maximum: 255 },
    max_micheline_node_count: {
      type: "integer",
      minimum: -1073741824,
      maximum: 1073741823,
    },
    max_micheline_bytes_limit: {
      type: "integer",
      minimum: -1073741824,
      maximum: 1073741823,
    },
    max_allowed_global_constants_depth: {
      type: "integer",
      minimum: -1073741824,
      maximum: 1073741823,
    },
    cache_layout: { type: "array", items: int64 },
    michelson_maximum_type_size: {
      type: "integer",
      minimum: 0,
      maximum: 65535,
    },
    preserved_cycles: { type: "integer", minimum: 0, maximum: 255 },
    blocks_per_cycle: {
      type: "integer",
      minimum: -2147483648,
      maximum: 2147483647,
    },
    blocks_per_commitment: {
      type: "integer",
      minimum: -2147483648,
      maximum: 2147483647,
    },
    blocks_per_roll_snapshot: {
      type: "integer",
      minimum: -2147483648,
      maximum: 2147483647,
    },
    blocks_per_voting_period: {
      type: "integer",
      minimum: -2147483648,
      maximum: 2147483647,
    },
    time_between_blocks: { type: "array", items: int64 },
    endorsers_per_block: { type: "integer", minimum: 0, maximum: 65535 },
    hard_gas_limit_per_operation: bignum,
    hard_gas_limit_per_block: bignum,
    proof_of_work_threshold: int64,
    tokens_per_roll: _011_PtHangz2$mutez,
    seed_nonce_revelation_tip: _011_PtHangz2$mutez,
    origination_size: {
      type: "integer",
      minimum: -1073741824,
      maximum: 1073741823,
    },
    block_security_deposit: _011_PtHangz2$mutez,
    endorsement_security_deposit: _011_PtHangz2$mutez,
    baking_reward_per_endorsement: {
      type: "array",
      items: _011_PtHangz2$mutez,
    },
    endorsement_reward: { type: "array", items: _011_PtHangz2$mutez },
    cost_per_byte: _011_PtHangz2$mutez,
    hard_storage_limit_per_operation: bignum,
    quorum_min: { type: "integer", minimum: -2147483648, maximum: 2147483647 },
    quorum_max: { type: "integer", minimum: -2147483648, maximum: 2147483647 },
    min_proposal_quorum: {
      type: "integer",
      minimum: -2147483648,
      maximum: 2147483647,
    },
    initial_endorsers: { type: "integer", minimum: 0, maximum: 65535 },
    delay_per_missing_endorsement: int64,
    minimal_block_delay: int64,
    liquidity_baking_subsidy: _011_PtHangz2$mutez,
    liquidity_baking_sunset_level: {
      type: "integer",
      minimum: -2147483648,
      maximum: 2147483647,
    },
    liquidity_baking_escape_ema_threshold: {
      type: "integer",
      minimum: -2147483648,
      maximum: 2147483647,
    },
  },
  required: [
    "liquidity_baking_escape_ema_threshold",
    "liquidity_baking_sunset_level",
    "liquidity_baking_subsidy",
    "minimal_block_delay",
    "delay_per_missing_endorsement",
    "initial_endorsers",
    "min_proposal_quorum",
    "quorum_max",
    "quorum_min",
    "hard_storage_limit_per_operation",
    "cost_per_byte",
    "endorsement_reward",
    "baking_reward_per_endorsement",
    "endorsement_security_deposit",
    "block_security_deposit",
    "origination_size",
    "seed_nonce_revelation_tip",
    "tokens_per_roll",
    "proof_of_work_threshold",
    "hard_gas_limit_per_block",
    "hard_gas_limit_per_operation",
    "endorsers_per_block",
    "time_between_blocks",
    "blocks_per_voting_period",
    "blocks_per_roll_snapshot",
    "blocks_per_commitment",
    "blocks_per_cycle",
    "preserved_cycles",
    "michelson_maximum_type_size",
    "cache_layout",
    "max_allowed_global_constants_depth",
    "max_micheline_bytes_limit",
    "max_micheline_node_count",
    "max_proposals_per_delegate",
    "max_operation_data_length",
    "max_anon_ops_per_block",
    "nonce_length",
    "proof_of_work_nonce_size",
  ],
  additionalProperties: false,
} as const;

import { FromSchema } from "json-schema-to-ts";
type T = FromSchema<typeof schema>;
export default T;
