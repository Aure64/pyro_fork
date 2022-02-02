import test_chain_status from "./test_chain_status";
import Signature$Public_key_hash from "./Signature$Public_key_hash";
import cycle_nonce from "./cycle_nonce";
import positive_bignum from "./positive_bignum";
import _012_Psithaca$operation_metadata$alpha$balance_updates from "./_012_Psithaca$operation_metadata$alpha$balance_updates";
import _012_Psithaca$operation$alpha$successful_manager_operation_result from "./_012_Psithaca$operation$alpha$successful_manager_operation_result";

const block_header_metadata = {
  type: "object",
  properties: {
    protocol: {
      type: "string",
      enum: ["Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A"],
    },
    next_protocol: {
      type: "string",
      enum: ["Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A"],
    },
    test_chain_status: test_chain_status,
    max_operations_ttl: {
      type: "integer",
      minimum: -1073741824,
      maximum: 1073741823,
    },
    max_operation_data_length: {
      type: "integer",
      minimum: -1073741824,
      maximum: 1073741823,
    },
    max_block_header_length: {
      type: "integer",
      minimum: -1073741824,
      maximum: 1073741823,
    },
    max_operation_list_length: {
      type: "array",
      items: {
        type: "object",
        properties: {
          max_size: {
            type: "integer",
            minimum: -1073741824,
            maximum: 1073741823,
          },
          max_op: {
            type: "integer",
            minimum: -1073741824,
            maximum: 1073741823,
          },
        },
        required: ["max_size"],
        additionalProperties: false,
      },
    },
    proposer: Signature$Public_key_hash,
    baker: Signature$Public_key_hash,
    level_info: {
      type: "object",
      properties: {
        level: {
          description:
            "The level of the block relative to genesis. This is also the Shell's notion of level.",
          type: "integer",
          minimum: -2147483648,
          maximum: 2147483647,
        },
        level_position: {
          description:
            'The level of the block relative to the successor of the genesis block. More precisely, it is the position of the block relative to the block that starts the "Alpha family" of protocols, which includes all protocols except Genesis (that is, from 001 onwards).',
          type: "integer",
          minimum: -2147483648,
          maximum: 2147483647,
        },
        cycle: {
          description:
            "The current cycle's number. Note that cycles are a protocol-specific notion. As a result, the cycle number starts at 0 with the first block of the Alpha family of protocols.",
          type: "integer",
          minimum: -2147483648,
          maximum: 2147483647,
        },
        cycle_position: {
          description:
            "The current level of the block relative to the first block of the current cycle.",
          type: "integer",
          minimum: -2147483648,
          maximum: 2147483647,
        },
        expected_commitment: {
          description:
            "Tells whether the baker of this block has to commit a seed nonce hash.",
          type: "boolean",
        },
      },
      required: [
        "expected_commitment",
        "cycle_position",
        "cycle",
        "level_position",
        "level",
      ],
      additionalProperties: false,
    },
    voting_period_info: {
      type: "object",
      properties: {
        voting_period: {
          description: "The voting period to which the block belongs.",
          type: "object",
          properties: {
            index: {
              description:
                "The voting period's index. Starts at 0 with the first block of the Alpha family of protocols.",
              type: "integer",
              minimum: -2147483648,
              maximum: 2147483647,
            },
            kind: {
              description:
                "One of the several kinds of periods in the voting procedure.",
              oneOf: [
                { title: "Proposal", type: "string", enum: ["proposal"] },
                { title: "exploration", type: "string", enum: ["exploration"] },
                { title: "Cooldown", type: "string", enum: ["cooldown"] },
                { title: "Promotion", type: "string", enum: ["promotion"] },
                { title: "Adoption", type: "string", enum: ["adoption"] },
              ],
            },
            start_position: {
              description:
                "The relative position of the first level of the period with respect to the first level of the Alpha family of protocols.",
              type: "integer",
              minimum: -2147483648,
              maximum: 2147483647,
            },
          },
          required: ["start_position", "kind", "index"],
          additionalProperties: false,
        },
        position: {
          description: "The position of the block within the voting period.",
          type: "integer",
          minimum: -2147483648,
          maximum: 2147483647,
        },
        remaining: {
          description:
            "The number of blocks remaining till the end of the voting period.",
          type: "integer",
          minimum: -2147483648,
          maximum: 2147483647,
        },
      },
      required: ["remaining", "position", "voting_period"],
      additionalProperties: false,
    },
    nonce_hash: { oneOf: [cycle_nonce, { title: "None", type: "null" }] },
    consumed_gas: positive_bignum,
    deactivated: { type: "array", items: Signature$Public_key_hash },
    balance_updates: _012_Psithaca$operation_metadata$alpha$balance_updates,
    liquidity_baking_escape_ema: {
      type: "integer",
      minimum: -2147483648,
      maximum: 2147483647,
    },
    implicit_operations_results: {
      type: "array",
      items: _012_Psithaca$operation$alpha$successful_manager_operation_result,
    },
  },
  required: [
    "implicit_operations_results",
    "liquidity_baking_escape_ema",
    "balance_updates",
    "deactivated",
    "consumed_gas",
    "nonce_hash",
    "voting_period_info",
    "level_info",
    "baker",
    "proposer",
    "max_operation_list_length",
    "max_block_header_length",
    "max_operation_data_length",
    "max_operations_ttl",
    "test_chain_status",
    "next_protocol",
    "protocol",
  ],
  additionalProperties: false,
} as const;
export default block_header_metadata;
