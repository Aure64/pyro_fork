import bignum from "./bignum";
import script_expr from "./script_expr";
import unistring from "./unistring";
import micheline$012_Psithaca$michelson_v1$expression from "./micheline$012_Psithaca$michelson_v1$expression";
import _012_Psithaca$michelson$v1$primitives from "./_012_Psithaca$michelson$v1$primitives";
import _012_Psithaca$operation_metadata$alpha$balance_updates from "./_012_Psithaca$operation_metadata$alpha$balance_updates";
import _012_Psithaca$contract_id from "./_012_Psithaca$contract_id";
import positive_bignum from "./positive_bignum";
import _012_Psithaca$lazy_storage_diff from "./_012_Psithaca$lazy_storage_diff";
import _012_Psithaca$error from "./_012_Psithaca$error";

const _012_Psithaca$operation$alpha$operation_result$origination = {
  oneOf: [
    {
      title: "Applied",
      type: "object",
      properties: {
        status: { type: "string", enum: ["applied"] },
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
                            items:
                              micheline$012_Psithaca$michelson_v1$expression,
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
                            items:
                              micheline$012_Psithaca$michelson_v1$expression,
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
                            items:
                              micheline$012_Psithaca$michelson_v1$expression,
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
                            items:
                              micheline$012_Psithaca$michelson_v1$expression,
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
        balance_updates: _012_Psithaca$operation_metadata$alpha$balance_updates,
        originated_contracts: {
          type: "array",
          items: _012_Psithaca$contract_id,
        },
        consumed_gas: positive_bignum,
        consumed_milligas: positive_bignum,
        storage_size: bignum,
        paid_storage_size_diff: bignum,
        lazy_storage_diff: _012_Psithaca$lazy_storage_diff,
      },
      required: ["status"],
      additionalProperties: false,
    },
    {
      title: "Failed",
      type: "object",
      properties: {
        status: { type: "string", enum: ["failed"] },
        errors: { type: "array", items: _012_Psithaca$error },
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
        errors: { type: "array", items: _012_Psithaca$error },
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
                            items:
                              micheline$012_Psithaca$michelson_v1$expression,
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
                            items:
                              micheline$012_Psithaca$michelson_v1$expression,
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
                            items:
                              micheline$012_Psithaca$michelson_v1$expression,
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
                            items:
                              micheline$012_Psithaca$michelson_v1$expression,
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
        balance_updates: _012_Psithaca$operation_metadata$alpha$balance_updates,
        originated_contracts: {
          type: "array",
          items: _012_Psithaca$contract_id,
        },
        consumed_gas: positive_bignum,
        consumed_milligas: positive_bignum,
        storage_size: bignum,
        paid_storage_size_diff: bignum,
        lazy_storage_diff: _012_Psithaca$lazy_storage_diff,
      },
      required: ["status"],
      additionalProperties: false,
    },
  ],
} as const;
export default _012_Psithaca$operation$alpha$operation_result$origination;
