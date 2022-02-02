import value_hash from "./value_hash";
import _012_Psithaca$inlined$endorsement from "./_012_Psithaca$inlined$endorsement";
import _012_Psithaca$inlined$preendorsement from "./_012_Psithaca$inlined$preendorsement";
import _012_Psithaca$block_header$alpha$full_header from "./_012_Psithaca$block_header$alpha$full_header";
import Ed25519$Public_key_hash from "./Ed25519$Public_key_hash";
import Signature$Public_key_hash from "./Signature$Public_key_hash";
import Protocol_hash from "./Protocol_hash";
import _012_Psithaca$mutez from "./_012_Psithaca$mutez";
import positive_bignum from "./positive_bignum";
import Signature$Public_key from "./Signature$Public_key";
import _012_Psithaca$contract_id from "./_012_Psithaca$contract_id";
import _012_Psithaca$entrypoint from "./_012_Psithaca$entrypoint";
import bignum from "./bignum";
import unistring from "./unistring";
import micheline$012_Psithaca$michelson_v1$expression from "./micheline$012_Psithaca$michelson_v1$expression";
import _012_Psithaca$michelson$v1$primitives from "./_012_Psithaca$michelson$v1$primitives";
import _012_Psithaca$scripted$contracts from "./_012_Psithaca$scripted$contracts";

const _012_Psithaca$operation$alpha$contents = {
  oneOf: [
    {
      title: "Endorsement",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["endorsement"] },
        slot: { type: "integer", minimum: 0, maximum: 65535 },
        level: { type: "integer", minimum: -2147483648, maximum: 2147483647 },
        round: { type: "integer", minimum: -2147483648, maximum: 2147483647 },
        block_payload_hash: value_hash,
      },
      required: ["block_payload_hash", "round", "level", "slot", "kind"],
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
      },
      required: ["block_payload_hash", "round", "level", "slot", "kind"],
      additionalProperties: false,
    },
    {
      title: "Seed_nonce_revelation",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["seed_nonce_revelation"] },
        level: { type: "integer", minimum: -2147483648, maximum: 2147483647 },
        nonce: { type: "string", pattern: "^([a-zA-Z0-9][a-zA-Z0-9])*$" },
      },
      required: ["nonce", "level", "kind"],
      additionalProperties: false,
    },
    {
      title: "Double_endorsement_evidence",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["double_endorsement_evidence"] },
        op1: _012_Psithaca$inlined$endorsement,
        op2: _012_Psithaca$inlined$endorsement,
      },
      required: ["op2", "op1", "kind"],
      additionalProperties: false,
    },
    {
      title: "Double_preendorsement_evidence",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["double_preendorsement_evidence"] },
        op1: _012_Psithaca$inlined$preendorsement,
        op2: _012_Psithaca$inlined$preendorsement,
      },
      required: ["op2", "op1", "kind"],
      additionalProperties: false,
    },
    {
      title: "Double_baking_evidence",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["double_baking_evidence"] },
        bh1: _012_Psithaca$block_header$alpha$full_header,
        bh2: _012_Psithaca$block_header$alpha$full_header,
      },
      required: ["bh2", "bh1", "kind"],
      additionalProperties: false,
    },
    {
      title: "Activate_account",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["activate_account"] },
        pkh: Ed25519$Public_key_hash,
        secret: { type: "string", pattern: "^([a-zA-Z0-9][a-zA-Z0-9])*$" },
      },
      required: ["secret", "pkh", "kind"],
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
      },
      required: ["proposals", "period", "source", "kind"],
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
      },
      required: ["ballot", "proposal", "period", "source", "kind"],
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
      },
      required: [
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
      },
      required: [
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
      },
      required: [
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
      },
      required: [
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
      },
      required: [
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
      title: "Failing_noop",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["failing_noop"] },
        arbitrary: unistring,
      },
      required: ["arbitrary", "kind"],
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
      },
      required: [
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
  ],
} as const;
export default _012_Psithaca$operation$alpha$contents;
