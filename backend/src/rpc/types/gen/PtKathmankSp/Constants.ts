/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Decimal representation of a big number
 */
export type BigNumber = string;
/**
 * Decimal representation of 64 bit integers
 */
export type BitIntegers = string;
/**
 * Decimal representation of a positive big number
 */
export type PositiveBigNumber = string;
export type Signature$PublicKeyHash = string;

export interface Constants {
  proof_of_work_nonce_size: number;
  nonce_length: number;
  max_anon_ops_per_block: number;
  max_operation_data_length: number;
  max_proposals_per_delegate: number;
  max_micheline_node_count: number;
  max_micheline_bytes_limit: number;
  max_allowed_global_constants_depth: number;
  cache_layout_size: number;
  michelson_maximum_type_size: number;
  max_wrapped_proof_binary_size: number;
  preserved_cycles: number;
  blocks_per_cycle: number;
  blocks_per_commitment: number;
  nonce_revelation_threshold: number;
  blocks_per_stake_snapshot: number;
  cycles_per_voting_period: number;
  hard_gas_limit_per_operation: BigNumber;
  hard_gas_limit_per_block: BigNumber;
  proof_of_work_threshold: BitIntegers;
  tokens_per_roll: PositiveBigNumber;
  vdf_difficulty: BitIntegers;
  seed_nonce_revelation_tip: PositiveBigNumber;
  origination_size: number;
  baking_reward_fixed_portion: PositiveBigNumber;
  baking_reward_bonus_per_slot: PositiveBigNumber;
  endorsing_reward_per_slot: PositiveBigNumber;
  cost_per_byte: PositiveBigNumber;
  hard_storage_limit_per_operation: BigNumber;
  quorum_min: number;
  quorum_max: number;
  min_proposal_quorum: number;
  liquidity_baking_subsidy: PositiveBigNumber;
  liquidity_baking_sunset_level: number;
  liquidity_baking_toggle_ema_threshold: number;
  max_operations_time_to_live: number;
  minimal_block_delay: BitIntegers;
  delay_increment_per_round: BitIntegers;
  consensus_committee_size: number;
  consensus_threshold: number;
  minimal_participation_ratio: {
    numerator: number;
    denominator: number;
  };
  max_slashing_period: number;
  frozen_deposits_percentage: number;
  double_baking_punishment: PositiveBigNumber;
  ratio_of_frozen_deposits_slashed_per_double_endorsement: {
    numerator: number;
    denominator: number;
  };
  testnet_dictator?: Signature$PublicKeyHash;
  initial_seed?: Signature$PublicKeyHash;
  cache_script_size: number;
  cache_stake_distribution_cycles: number;
  cache_sampler_state_cycles: number;
  tx_rollup_enable: boolean;
  tx_rollup_origination_size: number;
  tx_rollup_hard_size_limit_per_inbox: number;
  tx_rollup_hard_size_limit_per_message: number;
  tx_rollup_max_withdrawals_per_batch: number;
  tx_rollup_commitment_bond: PositiveBigNumber;
  tx_rollup_finality_period: number;
  tx_rollup_withdraw_period: number;
  tx_rollup_max_inboxes_count: number;
  tx_rollup_max_messages_per_inbox: number;
  tx_rollup_max_commitments_count: number;
  tx_rollup_cost_per_byte_ema_factor: number;
  tx_rollup_max_ticket_payload_size: number;
  tx_rollup_rejection_max_proof_size: number;
  tx_rollup_sunset_level: number;
  dal_parametric: {
    feature_enable: boolean;
    number_of_slots: number;
    number_of_shards: number;
    endorsement_lag: number;
    availability_threshold: number;
  };
  sc_rollup_enable: boolean;
  sc_rollup_origination_size: number;
  sc_rollup_challenge_window_in_blocks: number;
  sc_rollup_max_available_messages: number;
  sc_rollup_stake_amount: PositiveBigNumber;
  sc_rollup_commitment_period_in_blocks: number;
  sc_rollup_max_lookahead_in_blocks: number;
  sc_rollup_max_active_outbox_levels: number;
  sc_rollup_max_outbox_messages_per_level: number;
}