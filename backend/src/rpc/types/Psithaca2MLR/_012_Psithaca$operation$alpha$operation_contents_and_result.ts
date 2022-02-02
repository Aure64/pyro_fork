import _012_Psithaca$operation_metadata$alpha$balance_updates from "./_012_Psithaca$operation_metadata$alpha$balance_updates";
import value_hash from "./value_hash";
import Signature$Public_key_hash from "./Signature$Public_key_hash";
import _012_Psithaca$inlined$preendorsement from "./_012_Psithaca$inlined$preendorsement";
import _012_Psithaca$inlined$endorsement from "./_012_Psithaca$inlined$endorsement";
import _012_Psithaca$block_header$alpha$full_header from "./_012_Psithaca$block_header$alpha$full_header";
import Ed25519$Public_key_hash from "./Ed25519$Public_key_hash";
import Protocol_hash from "./Protocol_hash";
import _012_Psithaca$mutez from "./_012_Psithaca$mutez";
import positive_bignum from "./positive_bignum";
import Signature$Public_key from "./Signature$Public_key";
import _012_Psithaca$operation$alpha$operation_result$reveal from "./_012_Psithaca$operation$alpha$operation_result$reveal";
import _012_Psithaca$operation$alpha$internal_operation_result from "./_012_Psithaca$operation$alpha$internal_operation_result";
import _012_Psithaca$contract_id from "./_012_Psithaca$contract_id";
import _012_Psithaca$entrypoint from "./_012_Psithaca$entrypoint";
import bignum from "./bignum";
import unistring from "./unistring";
import micheline$012_Psithaca$michelson_v1$expression from "./micheline$012_Psithaca$michelson_v1$expression";
import _012_Psithaca$michelson$v1$primitives from "./_012_Psithaca$michelson$v1$primitives";
import _012_Psithaca$operation$alpha$operation_result$transaction from "./_012_Psithaca$operation$alpha$operation_result$transaction";
import _012_Psithaca$scripted$contracts from "./_012_Psithaca$scripted$contracts";
import _012_Psithaca$operation$alpha$operation_result$origination from "./_012_Psithaca$operation$alpha$operation_result$origination";
import _012_Psithaca$operation$alpha$operation_result$delegation from "./_012_Psithaca$operation$alpha$operation_result$delegation";
import _012_Psithaca$operation$alpha$operation_result$register_global_constant from "./_012_Psithaca$operation$alpha$operation_result$register_global_constant";
import _012_Psithaca$operation$alpha$operation_result$set_deposits_limit from "./_012_Psithaca$operation$alpha$operation_result$set_deposits_limit";

const _012_Psithaca$operation$alpha$operation_contents_and_result = {
  oneOf: [
    {
      title: "Seed_nonce_revelation",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["seed_nonce_revelation"] },
        level: { type: "integer", minimum: -2147483648, maximum: 2147483647 },
        nonce: { type: "string", pattern: "^([a-zA-Z0-9][a-zA-Z0-9])*$" },
        metadata: {
          type: "object",
          properties: {
            balance_updates:
              _012_Psithaca$operation_metadata$alpha$balance_updates,
          },
          required: ["balance_updates"],
          additionalProperties: false,
        },
      },
      required: ["metadata", "nonce", "level", "kind"],
      additionalProperties: false,
    },
    {
      title: "Endorsement",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["endorsement"] },
        slot: { type: "integer", minimum: 0, maximum: 65535 },
        level: { type: "integer", minimum: -2147483648, maximum: 2147483647 },
        round: { type: "integer", minimum: -2147483648, maximum: 2147483647 },
        block_payload_hash: value_hash,
        metadata: {
          type: "object",
          properties: {
            balance_updates:
              _012_Psithaca$operation_metadata$alpha$balance_updates,
            delegate: Signature$Public_key_hash,
            endorsement_power: {
              type: "integer",
              minimum: -1073741824,
              maximum: 1073741823,
            },
          },
          required: ["endorsement_power", "delegate", "balance_updates"],
          additionalProperties: false,
        },
      },
      required: [
        "metadata",
        "block_payload_hash",
        "round",
        "level",
        "slot",
        "kind",
      ],
      additionalProperties: false,
    },
    {
      title: "Preendorsement",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["preendorsement"] },
        slot: { type: "integer", minimum: 0, maximum: 65535 },
        level: { type: "integer", minimum: -2147483648, maximum: 2147483647 },
        round: { type: "integer", minimum: -2147483648, maximum: 2147483647 },
        block_payload_hash: value_hash,
        metadata: {
          type: "object",
          properties: {
            balance_updates:
              _012_Psithaca$operation_metadata$alpha$balance_updates,
            delegate: Signature$Public_key_hash,
            preendorsement_power: {
              type: "integer",
              minimum: -1073741824,
              maximum: 1073741823,
            },
          },
          required: ["preendorsement_power", "delegate", "balance_updates"],
          additionalProperties: false,
        },
      },
      required: [
        "metadata",
        "block_payload_hash",
        "round",
        "level",
        "slot",
        "kind",
      ],
      additionalProperties: false,
    },
    {
      title: "Double_preendorsement_evidence",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["double_preendorsement_evidence"] },
        op1: _012_Psithaca$inlined$preendorsement,
        op2: _012_Psithaca$inlined$preendorsement,
        metadata: {
          type: "object",
          properties: {
            balance_updates:
              _012_Psithaca$operation_metadata$alpha$balance_updates,
          },
          required: ["balance_updates"],
          additionalProperties: false,
        },
      },
      required: ["metadata", "op2", "op1", "kind"],
      additionalProperties: false,
    },
    {
      title: "Double_endorsement_evidence",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["double_endorsement_evidence"] },
        op1: _012_Psithaca$inlined$endorsement,
        op2: _012_Psithaca$inlined$endorsement,
        metadata: {
          type: "object",
          properties: {
            balance_updates:
              _012_Psithaca$operation_metadata$alpha$balance_updates,
          },
          required: ["balance_updates"],
          additionalProperties: false,
        },
      },
      required: ["metadata", "op2", "op1", "kind"],
      additionalProperties: false,
    },
    {
      title: "Double_baking_evidence",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["double_baking_evidence"] },
        bh1: _012_Psithaca$block_header$alpha$full_header,
        bh2: _012_Psithaca$block_header$alpha$full_header,
        metadata: {
          type: "object",
          properties: {
            balance_updates:
              _012_Psithaca$operation_metadata$alpha$balance_updates,
          },
          required: ["balance_updates"],
          additionalProperties: false,
        },
      },
      required: ["metadata", "bh2", "bh1", "kind"],
      additionalProperties: false,
    },
    {
      title: "Activate_account",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["activate_account"] },
        pkh: Ed25519$Public_key_hash,
        secret: { type: "string", pattern: "^([a-zA-Z0-9][a-zA-Z0-9])*$" },
        metadata: {
          type: "object",
          properties: {
            balance_updates:
              _012_Psithaca$operation_metadata$alpha$balance_updates,
          },
          required: ["balance_updates"],
          additionalProperties: false,
        },
      },
      required: ["metadata", "secret", "pkh", "kind"],
      additionalProperties: false,
    },
    {
      title: "Proposals",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["proposals"] },
        source: Signature$Public_key_hash,
        period: { type: "integer", minimum: -2147483648, maximum: 2147483647 },
        proposals: { type: "array", items: Protocol_hash },
        metadata: {
          type: "object",
          properties: {},
          additionalProperties: false,
        },
      },
      required: ["metadata", "proposals", "period", "source", "kind"],
      additionalProperties: false,
    },
    {
      title: "Ballot",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["ballot"] },
        source: Signature$Public_key_hash,
        period: { type: "integer", minimum: -2147483648, maximum: 2147483647 },
        proposal: Protocol_hash,
        ballot: { type: "string", enum: ["nay", "yay", "pass"] },
        metadata: {
          type: "object",
          properties: {},
          additionalProperties: false,
        },
      },
      required: ["metadata", "ballot", "proposal", "period", "source", "kind"],
      additionalProperties: false,
    },
    {
      title: "Reveal",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["reveal"] },
        source: Signature$Public_key_hash,
        fee: _012_Psithaca$mutez,
        counter: positive_bignum,
        gas_limit: positive_bignum,
        storage_limit: positive_bignum,
        public_key: Signature$Public_key,
        metadata: {
          type: "object",
          properties: {
            balance_updates:
              _012_Psithaca$operation_metadata$alpha$balance_updates,
            operation_result:
              _012_Psithaca$operation$alpha$operation_result$reveal,
            internal_operation_results: {
              type: "array",
              items: _012_Psithaca$operation$alpha$internal_operation_result,
            },
          },
          required: ["operation_result", "balance_updates"],
          additionalProperties: false,
        },
      },
      required: [
        "metadata",
        "public_key",
        "storage_limit",
        "gas_limit",
        "counter",
        "fee",
        "source",
        "kind",
      ],
      additionalProperties: false,
    },
    {
      title: "Transaction",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["transaction"] },
        source: Signature$Public_key_hash,
        fee: _012_Psithaca$mutez,
        counter: positive_bignum,
        gas_limit: positive_bignum,
        storage_limit: positive_bignum,
        amount: _012_Psithaca$mutez,
        destination: _012_Psithaca$contract_id,
        parameters: {
          type: "object",
          properties: {
            entrypoint: _012_Psithaca$entrypoint,
            value: {
              oneOf: [
                {
                  title: "Int",
                  type: "object",
                  properties: { int: bignum },
                  required: ["int"],
                  additionalProperties: false,
                },
                {
                  title: "String",
                  type: "object",
                  properties: { string: unistring },
                  required: ["string"],
                  additionalProperties: false,
                },
                {
                  title: "Bytes",
                  type: "object",
                  properties: {
                    bytes: {
                      type: "string",
                      pattern: "^([a-zA-Z0-9][a-zA-Z0-9])*$",
                    },
                  },
                  required: ["bytes"],
                  additionalProperties: false,
                },
                {
                  title: "Sequence",
                  type: "array",
                  items: micheline$012_Psithaca$michelson_v1$expression,
                },
                {
                  title: "Prim__generic",
                  description:
                    "Generic primitive (any number of args with or without annotations)",
                  type: "object",
                  properties: {
                    prim: _012_Psithaca$michelson$v1$primitives,
                    args: {
                      type: "array",
                      items: micheline$012_Psithaca$michelson_v1$expression,
                    },
                    annots: { type: "array", items: { type: "string" } },
                  },
                  required: ["prim"],
                  additionalProperties: false,
                },
              ],
            },
          },
          required: ["value", "entrypoint"],
          additionalProperties: false,
        },
        metadata: {
          type: "object",
          properties: {
            balance_updates:
              _012_Psithaca$operation_metadata$alpha$balance_updates,
            operation_result:
              _012_Psithaca$operation$alpha$operation_result$transaction,
            internal_operation_results: {
              type: "array",
              items: _012_Psithaca$operation$alpha$internal_operation_result,
            },
          },
          required: ["operation_result", "balance_updates"],
          additionalProperties: false,
        },
      },
      required: [
        "metadata",
        "destination",
        "amount",
        "storage_limit",
        "gas_limit",
        "counter",
        "fee",
        "source",
        "kind",
      ],
      additionalProperties: false,
    },
    {
      title: "Origination",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["origination"] },
        source: Signature$Public_key_hash,
        fee: _012_Psithaca$mutez,
        counter: positive_bignum,
        gas_limit: positive_bignum,
        storage_limit: positive_bignum,
        balance: _012_Psithaca$mutez,
        delegate: Signature$Public_key_hash,
        script: _012_Psithaca$scripted$contracts,
        metadata: {
          type: "object",
          properties: {
            balance_updates:
              _012_Psithaca$operation_metadata$alpha$balance_updates,
            operation_result:
              _012_Psithaca$operation$alpha$operation_result$origination,
            internal_operation_results: {
              type: "array",
              items: _012_Psithaca$operation$alpha$internal_operation_result,
            },
          },
          required: ["operation_result", "balance_updates"],
          additionalProperties: false,
        },
      },
      required: [
        "metadata",
        "script",
        "balance",
        "storage_limit",
        "gas_limit",
        "counter",
        "fee",
        "source",
        "kind",
      ],
      additionalProperties: false,
    },
    {
      title: "Delegation",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["delegation"] },
        source: Signature$Public_key_hash,
        fee: _012_Psithaca$mutez,
        counter: positive_bignum,
        gas_limit: positive_bignum,
        storage_limit: positive_bignum,
        delegate: Signature$Public_key_hash,
        metadata: {
          type: "object",
          properties: {
            balance_updates:
              _012_Psithaca$operation_metadata$alpha$balance_updates,
            operation_result:
              _012_Psithaca$operation$alpha$operation_result$delegation,
            internal_operation_results: {
              type: "array",
              items: _012_Psithaca$operation$alpha$internal_operation_result,
            },
          },
          required: ["operation_result", "balance_updates"],
          additionalProperties: false,
        },
      },
      required: [
        "metadata",
        "storage_limit",
        "gas_limit",
        "counter",
        "fee",
        "source",
        "kind",
      ],
      additionalProperties: false,
    },
    {
      title: "Register_global_constant",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["register_global_constant"] },
        source: Signature$Public_key_hash,
        fee: _012_Psithaca$mutez,
        counter: positive_bignum,
        gas_limit: positive_bignum,
        storage_limit: positive_bignum,
        value: {
          oneOf: [
            {
              title: "Int",
              type: "object",
              properties: { int: bignum },
              required: ["int"],
              additionalProperties: false,
            },
            {
              title: "String",
              type: "object",
              properties: { string: unistring },
              required: ["string"],
              additionalProperties: false,
            },
            {
              title: "Bytes",
              type: "object",
              properties: {
                bytes: {
                  type: "string",
                  pattern: "^([a-zA-Z0-9][a-zA-Z0-9])*$",
                },
              },
              required: ["bytes"],
              additionalProperties: false,
            },
            {
              title: "Sequence",
              type: "array",
              items: micheline$012_Psithaca$michelson_v1$expression,
            },
            {
              title: "Prim__generic",
              description:
                "Generic primitive (any number of args with or without annotations)",
              type: "object",
              properties: {
                prim: _012_Psithaca$michelson$v1$primitives,
                args: {
                  type: "array",
                  items: micheline$012_Psithaca$michelson_v1$expression,
                },
                annots: { type: "array", items: { type: "string" } },
              },
              required: ["prim"],
              additionalProperties: false,
            },
          ],
        },
        metadata: {
          type: "object",
          properties: {
            balance_updates:
              _012_Psithaca$operation_metadata$alpha$balance_updates,
            operation_result:
              _012_Psithaca$operation$alpha$operation_result$register_global_constant,
            internal_operation_results: {
              type: "array",
              items: _012_Psithaca$operation$alpha$internal_operation_result,
            },
          },
          required: ["operation_result", "balance_updates"],
          additionalProperties: false,
        },
      },
      required: [
        "metadata",
        "value",
        "storage_limit",
        "gas_limit",
        "counter",
        "fee",
        "source",
        "kind",
      ],
      additionalProperties: false,
    },
    {
      title: "Set_deposits_limit",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["set_deposits_limit"] },
        source: Signature$Public_key_hash,
        fee: _012_Psithaca$mutez,
        counter: positive_bignum,
        gas_limit: positive_bignum,
        storage_limit: positive_bignum,
        limit: _012_Psithaca$mutez,
        metadata: {
          type: "object",
          properties: {
            balance_updates:
              _012_Psithaca$operation_metadata$alpha$balance_updates,
            operation_result:
              _012_Psithaca$operation$alpha$operation_result$set_deposits_limit,
            internal_operation_results: {
              type: "array",
              items: _012_Psithaca$operation$alpha$internal_operation_result,
            },
          },
          required: ["operation_result", "balance_updates"],
          additionalProperties: false,
        },
      },
      required: [
        "metadata",
        "storage_limit",
        "gas_limit",
        "counter",
        "fee",
        "source",
        "kind",
      ],
      additionalProperties: false,
    },
  ],
} as const;
export default _012_Psithaca$operation$alpha$operation_contents_and_result;
