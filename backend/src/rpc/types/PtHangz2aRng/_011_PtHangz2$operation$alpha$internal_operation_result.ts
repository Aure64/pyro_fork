import _011_PtHangz2$contract_id from "./_011_PtHangz2$contract_id";
import Signature$Public_key from "./Signature$Public_key";
import _011_PtHangz2$operation$alpha$operation_result$reveal from "./_011_PtHangz2$operation$alpha$operation_result$reveal";
import _011_PtHangz2$mutez from "./_011_PtHangz2$mutez";
import _011_PtHangz2$entrypoint from "./_011_PtHangz2$entrypoint";
import bignum from "./bignum";
import unistring from "./unistring";
import micheline$011_PtHangz2$michelson_v1$expression from "./micheline$011_PtHangz2$michelson_v1$expression";
import _011_PtHangz2$michelson$v1$primitives from "./_011_PtHangz2$michelson$v1$primitives";
import _011_PtHangz2$operation$alpha$operation_result$transaction from "./_011_PtHangz2$operation$alpha$operation_result$transaction";
import Signature$Public_key_hash from "./Signature$Public_key_hash";
import _011_PtHangz2$scripted$contracts from "./_011_PtHangz2$scripted$contracts";
import _011_PtHangz2$operation$alpha$operation_result$origination from "./_011_PtHangz2$operation$alpha$operation_result$origination";
import _011_PtHangz2$operation$alpha$operation_result$delegation from "./_011_PtHangz2$operation$alpha$operation_result$delegation";
import _011_PtHangz2$operation$alpha$operation_result$register_global_constant from "./_011_PtHangz2$operation$alpha$operation_result$register_global_constant";

const _011_PtHangz2$operation$alpha$internal_operation_result = {
  oneOf: [
    {
      title: "reveal",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["reveal"] },
        source: _011_PtHangz2$contract_id,
        nonce: { type: "integer", minimum: 0, maximum: 65535 },
        public_key: Signature$Public_key,
        result: _011_PtHangz2$operation$alpha$operation_result$reveal,
      },
      required: ["result", "public_key", "nonce", "source", "kind"],
      additionalProperties: false,
    },
    {
      title: "transaction",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["transaction"] },
        source: _011_PtHangz2$contract_id,
        nonce: { type: "integer", minimum: 0, maximum: 65535 },
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
        result: _011_PtHangz2$operation$alpha$operation_result$transaction,
      },
      required: ["result", "destination", "amount", "nonce", "source", "kind"],
      additionalProperties: false,
    },
    {
      title: "origination",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["origination"] },
        source: _011_PtHangz2$contract_id,
        nonce: { type: "integer", minimum: 0, maximum: 65535 },
        balance: _011_PtHangz2$mutez,
        delegate: Signature$Public_key_hash,
        script: _011_PtHangz2$scripted$contracts,
        result: _011_PtHangz2$operation$alpha$operation_result$origination,
      },
      required: ["result", "script", "balance", "nonce", "source", "kind"],
      additionalProperties: false,
    },
    {
      title: "delegation",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["delegation"] },
        source: _011_PtHangz2$contract_id,
        nonce: { type: "integer", minimum: 0, maximum: 65535 },
        delegate: Signature$Public_key_hash,
        result: _011_PtHangz2$operation$alpha$operation_result$delegation,
      },
      required: ["result", "nonce", "source", "kind"],
      additionalProperties: false,
    },
    {
      title: "register_global_constant",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["register_global_constant"] },
        source: _011_PtHangz2$contract_id,
        nonce: { type: "integer", minimum: 0, maximum: 65535 },
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
        result:
          _011_PtHangz2$operation$alpha$operation_result$register_global_constant,
      },
      required: ["result", "value", "nonce", "source", "kind"],
      additionalProperties: false,
    },
  ],
} as const;
export default _011_PtHangz2$operation$alpha$internal_operation_result;
