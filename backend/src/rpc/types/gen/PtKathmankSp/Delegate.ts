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
export type _014_PtKathma$ContractId = string;
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
  delegated_contracts: _014_PtKathma$ContractId[];
  delegated_balance: PositiveBigNumber;
  deactivated: boolean;
  grace_period: number;
  voting_power?: BitIntegers;
  current_ballot?: "nay" | "yay" | "pass";
  current_proposals?: _014_PtKathma$ContractId[];
  remaining_proposals?: number;
}
