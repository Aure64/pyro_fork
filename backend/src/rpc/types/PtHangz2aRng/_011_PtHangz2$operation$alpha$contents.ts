import _011_PtHangz2$inlined$endorsement from "./_011_PtHangz2$inlined$endorsement";
import _011_PtHangz2$block_header$alpha$full_header from "./_011_PtHangz2$block_header$alpha$full_header";
import Ed25519$Public_key_hash from "./Ed25519$Public_key_hash";
import Signature$Public_key_hash from "./Signature$Public_key_hash";
import Protocol_hash from "./Protocol_hash";
import _011_PtHangz2$mutez from "./_011_PtHangz2$mutez";
import positive_bignum from "./positive_bignum";
import Signature$Public_key from "./Signature$Public_key";
import _011_PtHangz2$contract_id from "./_011_PtHangz2$contract_id";
import _011_PtHangz2$entrypoint from "./_011_PtHangz2$entrypoint";
import bignum from "./bignum";
import unistring from "./unistring";
import micheline$011_PtHangz2$michelson_v1$expression from "./micheline$011_PtHangz2$michelson_v1$expression";
import _011_PtHangz2$michelson$v1$primitives from "./_011_PtHangz2$michelson$v1$primitives";
import _011_PtHangz2$scripted$contracts from "./_011_PtHangz2$scripted$contracts";

const _011_PtHangz2$operation$alpha$contents = {
  oneOf: [
    {
      title: "Endorsement",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["endorsement"] },
        level: { type: "integer", minimum: -2147483648, maximum: 2147483647 },
      },
      required: ["level", "kind"],
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
      title: "Endorsement_with_slot",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["endorsement_with_slot"] },
        endorsement: _011_PtHangz2$inlined$endorsement,
        slot: { type: "integer", minimum: 0, maximum: 65535 },
      },
      required: ["slot", "endorsement", "kind"],
      additionalProperties: false,
    },
    {
      title: "Double_endorsement_evidence",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["double_endorsement_evidence"] },
        op1: _011_PtHangz2$inlined$endorsement,
        op2: _011_PtHangz2$inlined$endorsement,
        slot: { type: "integer", minimum: 0, maximum: 65535 },
      },
      required: ["slot", "op2", "op1", "kind"],
      additionalProperties: false,
    },
    {
      title: "Double_baking_evidence",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["double_baking_evidence"] },
        bh1: _011_PtHangz2$block_header$alpha$full_header,
        bh2: _011_PtHangz2$block_header$alpha$full_header,
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
        fee: _011_PtHangz2$mutez,
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
        fee: _011_PtHangz2$mutez,
        counter: positive_bignum,
        gas_limit: positive_bignum,
        storage_limit: positive_bignum,
        amount: _011_PtHangz2$mutez,
        destination: _011_PtHangz2$contract_id,
        parameters: {
          type: "object",
          properties: {
            entrypoint: _011_PtHangz2$entrypoint,
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
                  items: micheline$011_PtHangz2$michelson_v1$expression,
                },
                {
                  title:
                    "Generic prim (any number of args with or without annot)",
                  type: "object",
                  properties: {
                    prim: _011_PtHangz2$michelson$v1$primitives,
                    args: {
                      type: "array",
                      items: micheline$011_PtHangz2$michelson_v1$expression,
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
        fee: _011_PtHangz2$mutez,
        counter: positive_bignum,
        gas_limit: positive_bignum,
        storage_limit: positive_bignum,
        balance: _011_PtHangz2$mutez,
        delegate: Signature$Public_key_hash,
        script: _011_PtHangz2$scripted$contracts,
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
        fee: _011_PtHangz2$mutez,
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
        fee: _011_PtHangz2$mutez,
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
              items: micheline$011_PtHangz2$michelson_v1$expression,
            },
            {
              title: "Generic prim (any number of args with or without annot)",
              type: "object",
              properties: {
                prim: _011_PtHangz2$michelson$v1$primitives,
                args: {
                  type: "array",
                  items: micheline$011_PtHangz2$michelson_v1$expression,
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
export default _011_PtHangz2$operation$alpha$contents;
