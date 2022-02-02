import _012_Psithaca$contract_id from "./_012_Psithaca$contract_id";
import Signature$Public_key from "./Signature$Public_key";
import _012_Psithaca$operation$alpha$operation_result$reveal from "./_012_Psithaca$operation$alpha$operation_result$reveal";
import _012_Psithaca$mutez from "./_012_Psithaca$mutez";
import _012_Psithaca$entrypoint from "./_012_Psithaca$entrypoint";
import bignum from "./bignum";
import unistring from "./unistring";
import micheline$012_Psithaca$michelson_v1$expression from "./micheline$012_Psithaca$michelson_v1$expression";
import _012_Psithaca$michelson$v1$primitives from "./_012_Psithaca$michelson$v1$primitives";
import _012_Psithaca$operation$alpha$operation_result$transaction from "./_012_Psithaca$operation$alpha$operation_result$transaction";
import Signature$Public_key_hash from "./Signature$Public_key_hash";
import _012_Psithaca$scripted$contracts from "./_012_Psithaca$scripted$contracts";
import _012_Psithaca$operation$alpha$operation_result$origination from "./_012_Psithaca$operation$alpha$operation_result$origination";
import _012_Psithaca$operation$alpha$operation_result$delegation from "./_012_Psithaca$operation$alpha$operation_result$delegation";
import _012_Psithaca$operation$alpha$operation_result$register_global_constant from "./_012_Psithaca$operation$alpha$operation_result$register_global_constant";
import _012_Psithaca$operation$alpha$operation_result$set_deposits_limit from "./_012_Psithaca$operation$alpha$operation_result$set_deposits_limit";

const _012_Psithaca$operation$alpha$internal_operation_result = {
  oneOf: [
    {
      title: "reveal",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["reveal"] },
        source: _012_Psithaca$contract_id,
        nonce: { type: "integer", minimum: 0, maximum: 65535 },
        public_key: Signature$Public_key,
        result: _012_Psithaca$operation$alpha$operation_result$reveal,
      },
      required: ["result", "public_key", "nonce", "source", "kind"],
      additionalProperties: false,
    },
    {
      title: "transaction",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["transaction"] },
        source: _012_Psithaca$contract_id,
        nonce: { type: "integer", minimum: 0, maximum: 65535 },
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
        result: _012_Psithaca$operation$alpha$operation_result$transaction,
      },
      required: ["result", "destination", "amount", "nonce", "source", "kind"],
      additionalProperties: false,
    },
    {
      title: "origination",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["origination"] },
        source: _012_Psithaca$contract_id,
        nonce: { type: "integer", minimum: 0, maximum: 65535 },
        balance: _012_Psithaca$mutez,
        delegate: Signature$Public_key_hash,
        script: _012_Psithaca$scripted$contracts,
        result: _012_Psithaca$operation$alpha$operation_result$origination,
      },
      required: ["result", "script", "balance", "nonce", "source", "kind"],
      additionalProperties: false,
    },
    {
      title: "delegation",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["delegation"] },
        source: _012_Psithaca$contract_id,
        nonce: { type: "integer", minimum: 0, maximum: 65535 },
        delegate: Signature$Public_key_hash,
        result: _012_Psithaca$operation$alpha$operation_result$delegation,
      },
      required: ["result", "nonce", "source", "kind"],
      additionalProperties: false,
    },
    {
      title: "register_global_constant",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["register_global_constant"] },
        source: _012_Psithaca$contract_id,
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
        result:
          _012_Psithaca$operation$alpha$operation_result$register_global_constant,
      },
      required: ["result", "value", "nonce", "source", "kind"],
      additionalProperties: false,
    },
    {
      title: "set_deposits_limit",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["set_deposits_limit"] },
        source: _012_Psithaca$contract_id,
        nonce: { type: "integer", minimum: 0, maximum: 65535 },
        limit: _012_Psithaca$mutez,
        result:
          _012_Psithaca$operation$alpha$operation_result$set_deposits_limit,
      },
      required: ["result", "nonce", "source", "kind"],
      additionalProperties: false,
    },
  ],
} as const;
export default _012_Psithaca$operation$alpha$internal_operation_result;
