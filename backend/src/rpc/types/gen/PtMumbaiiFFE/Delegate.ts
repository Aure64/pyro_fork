/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Decimal representation of a positive big number
 */
export type PositiveBigNumber = string;
export type _016_PtMumbai$ContractId = string;
/**
 * Decimal representation of 64 bit integers
 */
export type BitIntegers = string;

export interface Delegate {
  full_balance: PositiveBigNumber;
  current_frozen_deposits: PositiveBigNumber;
  frozen_deposits: PositiveBigNumber;
  staking_balance: PositiveBigNumber;
  frozen_deposits_limit?: PositiveBigNumber;
  delegated_contracts: _016_PtMumbai$ContractId[];
  delegated_balance: PositiveBigNumber;
  deactivated: boolean;
  grace_period: number;
  voting_power?: BitIntegers;
  current_ballot?: "nay" | "yay" | "pass";
  current_proposals?: _016_PtMumbai$ContractId[];
  remaining_proposals?: number;
  active_consensus_key: _016_PtMumbai$ContractId;
  pending_consensus_keys?: {
    cycle: number;
    pkh: _016_PtMumbai$ContractId;
  }[];
}
