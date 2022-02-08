/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export type ChainId = string;
/**
 * The fitness, or score, of a block, that allow the Tezos to decide which chain is the best. A fitness value is a list of byte sequences. They are compared as follows: shortest lists are smaller; lists of the same length are compared according to the lexicographical order.
 */
export type BlockFitness = string[];

/**
 * Block header's shell-related content. It contains information such as the block level, its predecessor and timestamp.
 */
export interface ShellHeader {
  protocol: "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A";
  chain_id: ChainId;
  hash: ChainId;
  level: number;
  proto: number;
  predecessor: ChainId;
  timestamp: ChainId;
  validation_pass: number;
  operations_hash: ChainId;
  fitness: BlockFitness;
  context: ChainId;
  payload_hash: ChainId;
  payload_round: number;
  proof_of_work_nonce: string;
  seed_nonce_hash?: ChainId;
  liquidity_baking_escape_vote: boolean;
  signature: ChainId;
}