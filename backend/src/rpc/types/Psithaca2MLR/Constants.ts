import positive_bignum from "../defs/positive_bignum";

import unistring from "../defs/unistring";

import bignum from "../defs/bignum";

import int64 from "../defs/int64";

import _012_Psithaca$mutez from "../defs/_012_Psithaca$mutez";

import Signature$Public_key from "../defs/Signature$Public_key";

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
    blocks_per_stake_snapshot: {
      type: "integer",
      minimum: -2147483648,
      maximum: 2147483647,
    },
    blocks_per_voting_period: {
      type: "integer",
      minimum: -2147483648,
      maximum: 2147483647,
    },
    hard_gas_limit_per_operation: bignum,
    hard_gas_limit_per_block: bignum,
    proof_of_work_threshold: int64,
    tokens_per_roll: _012_Psithaca$mutez,
    seed_nonce_revelation_tip: _012_Psithaca$mutez,
    origination_size: {
      type: "integer",
      minimum: -1073741824,
      maximum: 1073741823,
    },
    baking_reward_fixed_portion: _012_Psithaca$mutez,
    baking_reward_bonus_per_slot: _012_Psithaca$mutez,
    endorsing_reward_per_slot: _012_Psithaca$mutez,
    cost_per_byte: _012_Psithaca$mutez,
    hard_storage_limit_per_operation: bignum,
    quorum_min: { type: "integer", minimum: -2147483648, maximum: 2147483647 },
    quorum_max: { type: "integer", minimum: -2147483648, maximum: 2147483647 },
    min_proposal_quorum: {
      type: "integer",
      minimum: -2147483648,
      maximum: 2147483647,
    },
    liquidity_baking_subsidy: _012_Psithaca$mutez,
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
    max_operations_time_to_live: {
      type: "integer",
      minimum: -32768,
      maximum: 32767,
    },
    minimal_block_delay: int64,
    delay_increment_per_round: int64,
    consensus_committee_size: {
      type: "integer",
      minimum: -1073741824,
      maximum: 1073741823,
    },
    consensus_threshold: {
      type: "integer",
      minimum: -1073741824,
      maximum: 1073741823,
    },
    minimal_participation_ratio: {
      type: "object",
      properties: {
        numerator: { type: "integer", minimum: 0, maximum: 65535 },
        denominator: { type: "integer", minimum: 0, maximum: 65535 },
      },
      required: ["denominator", "numerator"],
      additionalProperties: false,
    },
    max_slashing_period: {
      type: "integer",
      minimum: -1073741824,
      maximum: 1073741823,
    },
    frozen_deposits_percentage: {
      type: "integer",
      minimum: -1073741824,
      maximum: 1073741823,
    },
    double_baking_punishment: _012_Psithaca$mutez,
    ratio_of_frozen_deposits_slashed_per_double_endorsement: {
      type: "object",
      properties: {
        numerator: { type: "integer", minimum: 0, maximum: 65535 },
        denominator: { type: "integer", minimum: 0, maximum: 65535 },
      },
      required: ["denominator", "numerator"],
      additionalProperties: false,
    },
    delegate_selection: {
      oneOf: [
        {
          title: "Random_delegate_selection",
          type: "string",
          enum: ["random"],
        },
        {
          title: "Round_robin_over_delegates",
          type: "array",
          items: { type: "array", items: Signature$Public_key },
        },
      ],
    },
  },
  required: [
    "ratio_of_frozen_deposits_slashed_per_double_endorsement",
    "double_baking_punishment",
    "frozen_deposits_percentage",
    "max_slashing_period",
    "minimal_participation_ratio",
    "consensus_threshold",
    "consensus_committee_size",
    "delay_increment_per_round",
    "minimal_block_delay",
    "max_operations_time_to_live",
    "liquidity_baking_escape_ema_threshold",
    "liquidity_baking_sunset_level",
    "liquidity_baking_subsidy",
    "min_proposal_quorum",
    "quorum_max",
    "quorum_min",
    "hard_storage_limit_per_operation",
    "cost_per_byte",
    "endorsing_reward_per_slot",
    "baking_reward_bonus_per_slot",
    "baking_reward_fixed_portion",
    "origination_size",
    "seed_nonce_revelation_tip",
    "tokens_per_roll",
    "proof_of_work_threshold",
    "hard_gas_limit_per_block",
    "hard_gas_limit_per_operation",
    "blocks_per_voting_period",
    "blocks_per_stake_snapshot",
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
