import bignum from "./bignum";
import unistring from "./unistring";
import micheline$011_PtHangz2$michelson_v1$expression from "./micheline$011_PtHangz2$michelson_v1$expression";
import _011_PtHangz2$michelson$v1$primitives from "./_011_PtHangz2$michelson$v1$primitives";
import script_expr from "./script_expr";
import _011_PtHangz2$operation_metadata$alpha$balance_updates from "./_011_PtHangz2$operation_metadata$alpha$balance_updates";
import _011_PtHangz2$contract_id from "./_011_PtHangz2$contract_id";
import positive_bignum from "./positive_bignum";
import _011_PtHangz2$lazy_storage_diff from "./_011_PtHangz2$lazy_storage_diff";
import _011_PtHangz2$error from "./_011_PtHangz2$error";

const _011_PtHangz2$operation$alpha$operation_result$transaction = {
  oneOf: [
    {
      title: "Applied",
      type: "object",
      properties: {
        status: { type: "string", enum: ["applied"] },
        storage: {
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
        big_map_diff: {
          type: "array",
          items: {
            oneOf: [
              {
                title: "update",
                type: "object",
                properties: {
                  action: { type: "string", enum: ["update"] },
                  big_map: bignum,
                  key_hash: script_expr,
                  key: {
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
                            items:
                              micheline$011_PtHangz2$michelson_v1$expression,
                          },
                          annots: { type: "array", items: { type: "string" } },
                        },
                        required: ["prim"],
                        additionalProperties: false,
                      },
                    ],
                  },
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
                            items:
                              micheline$011_PtHangz2$michelson_v1$expression,
                          },
                          annots: { type: "array", items: { type: "string" } },
                        },
                        required: ["prim"],
                        additionalProperties: false,
                      },
                    ],
                  },
                },
                required: ["key", "key_hash", "big_map", "action"],
                additionalProperties: false,
              },
              {
                title: "remove",
                type: "object",
                properties: {
                  action: { type: "string", enum: ["remove"] },
                  big_map: bignum,
                },
                required: ["big_map", "action"],
                additionalProperties: false,
              },
              {
                title: "copy",
                type: "object",
                properties: {
                  action: { type: "string", enum: ["copy"] },
                  source_big_map: bignum,
                  destination_big_map: bignum,
                },
                required: ["destination_big_map", "source_big_map", "action"],
                additionalProperties: false,
              },
              {
                title: "alloc",
                type: "object",
                properties: {
                  action: { type: "string", enum: ["alloc"] },
                  big_map: bignum,
                  key_type: {
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
                            items:
                              micheline$011_PtHangz2$michelson_v1$expression,
                          },
                          annots: { type: "array", items: { type: "string" } },
                        },
                        required: ["prim"],
                        additionalProperties: false,
                      },
                    ],
                  },
                  value_type: {
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
                            items:
                              micheline$011_PtHangz2$michelson_v1$expression,
                          },
                          annots: { type: "array", items: { type: "string" } },
                        },
                        required: ["prim"],
                        additionalProperties: false,
                      },
                    ],
                  },
                },
                required: ["value_type", "key_type", "big_map", "action"],
                additionalProperties: false,
              },
            ],
          },
        },
        balance_updates: _011_PtHangz2$operation_metadata$alpha$balance_updates,
        originated_contracts: {
          type: "array",
          items: _011_PtHangz2$contract_id,
        },
        consumed_gas: positive_bignum,
        consumed_milligas: positive_bignum,
        storage_size: bignum,
        paid_storage_size_diff: bignum,
        allocated_destination_contract: { type: "boolean" },
        lazy_storage_diff: _011_PtHangz2$lazy_storage_diff,
      },
      required: ["status"],
      additionalProperties: false,
    },
    {
      title: "Failed",
      type: "object",
      properties: {
        status: { type: "string", enum: ["failed"] },
        errors: { type: "array", items: _011_PtHangz2$error },
      },
      required: ["errors", "status"],
      additionalProperties: false,
    },
    {
      title: "Skipped",
      type: "object",
      properties: { status: { type: "string", enum: ["skipped"] } },
      required: ["status"],
      additionalProperties: false,
    },
    {
      title: "Backtracked",
      type: "object",
      properties: {
        status: { type: "string", enum: ["backtracked"] },
        errors: { type: "array", items: _011_PtHangz2$error },
        storage: {
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
        big_map_diff: {
          type: "array",
          items: {
            oneOf: [
              {
                title: "update",
                type: "object",
                properties: {
                  action: { type: "string", enum: ["update"] },
                  big_map: bignum,
                  key_hash: script_expr,
                  key: {
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
                            items:
                              micheline$011_PtHangz2$michelson_v1$expression,
                          },
                          annots: { type: "array", items: { type: "string" } },
                        },
                        required: ["prim"],
                        additionalProperties: false,
                      },
                    ],
                  },
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
                            items:
                              micheline$011_PtHangz2$michelson_v1$expression,
                          },
                          annots: { type: "array", items: { type: "string" } },
                        },
                        required: ["prim"],
                        additionalProperties: false,
                      },
                    ],
                  },
                },
                required: ["key", "key_hash", "big_map", "action"],
                additionalProperties: false,
              },
              {
                title: "remove",
                type: "object",
                properties: {
                  action: { type: "string", enum: ["remove"] },
                  big_map: bignum,
                },
                required: ["big_map", "action"],
                additionalProperties: false,
              },
              {
                title: "copy",
                type: "object",
                properties: {
                  action: { type: "string", enum: ["copy"] },
                  source_big_map: bignum,
                  destination_big_map: bignum,
                },
                required: ["destination_big_map", "source_big_map", "action"],
                additionalProperties: false,
              },
              {
                title: "alloc",
                type: "object",
                properties: {
                  action: { type: "string", enum: ["alloc"] },
                  big_map: bignum,
                  key_type: {
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
                            items:
                              micheline$011_PtHangz2$michelson_v1$expression,
                          },
                          annots: { type: "array", items: { type: "string" } },
                        },
                        required: ["prim"],
                        additionalProperties: false,
                      },
                    ],
                  },
                  value_type: {
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
                            items:
                              micheline$011_PtHangz2$michelson_v1$expression,
                          },
                          annots: { type: "array", items: { type: "string" } },
                        },
                        required: ["prim"],
                        additionalProperties: false,
                      },
                    ],
                  },
                },
                required: ["value_type", "key_type", "big_map", "action"],
                additionalProperties: false,
              },
            ],
          },
        },
        balance_updates: _011_PtHangz2$operation_metadata$alpha$balance_updates,
        originated_contracts: {
          type: "array",
          items: _011_PtHangz2$contract_id,
        },
        consumed_gas: positive_bignum,
        consumed_milligas: positive_bignum,
        storage_size: bignum,
        paid_storage_size_diff: bignum,
        allocated_destination_contract: { type: "boolean" },
        lazy_storage_diff: _011_PtHangz2$lazy_storage_diff,
      },
      required: ["status"],
      additionalProperties: false,
    },
  ],
} as const;
export default _011_PtHangz2$operation$alpha$operation_result$transaction;
