import _011_PtHangz2$big_map_id from "./_011_PtHangz2$big_map_id";
import script_expr from "./script_expr";
import bignum from "./bignum";
import unistring from "./unistring";
import micheline$011_PtHangz2$michelson_v1$expression from "./micheline$011_PtHangz2$michelson_v1$expression";
import _011_PtHangz2$michelson$v1$primitives from "./_011_PtHangz2$michelson$v1$primitives";
import _011_PtHangz2$sapling_state_id from "./_011_PtHangz2$sapling_state_id";
import sapling$transaction$commitment from "./sapling$transaction$commitment";
import sapling$transaction$ciphertext from "./sapling$transaction$ciphertext";
import sapling$transaction$nullifier from "./sapling$transaction$nullifier";

const _011_PtHangz2$lazy_storage_diff = {
  type: "array",
  items: {
    oneOf: [
      {
        title: "big_map",
        type: "object",
        properties: {
          kind: { type: "string", enum: ["big_map"] },
          id: _011_PtHangz2$big_map_id,
          diff: {
            oneOf: [
              {
                title: "update",
                type: "object",
                properties: {
                  action: { type: "string", enum: ["update"] },
                  updates: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
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
                              items:
                                micheline$011_PtHangz2$michelson_v1$expression,
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
                                annots: {
                                  type: "array",
                                  items: { type: "string" },
                                },
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
                              items:
                                micheline$011_PtHangz2$michelson_v1$expression,
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
                                annots: {
                                  type: "array",
                                  items: { type: "string" },
                                },
                              },
                              required: ["prim"],
                              additionalProperties: false,
                            },
                          ],
                        },
                      },
                      required: ["key", "key_hash"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["updates", "action"],
                additionalProperties: false,
              },
              {
                title: "remove",
                type: "object",
                properties: { action: { type: "string", enum: ["remove"] } },
                required: ["action"],
                additionalProperties: false,
              },
              {
                title: "copy",
                type: "object",
                properties: {
                  action: { type: "string", enum: ["copy"] },
                  source: _011_PtHangz2$big_map_id,
                  updates: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
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
                              items:
                                micheline$011_PtHangz2$michelson_v1$expression,
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
                                annots: {
                                  type: "array",
                                  items: { type: "string" },
                                },
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
                              items:
                                micheline$011_PtHangz2$michelson_v1$expression,
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
                                annots: {
                                  type: "array",
                                  items: { type: "string" },
                                },
                              },
                              required: ["prim"],
                              additionalProperties: false,
                            },
                          ],
                        },
                      },
                      required: ["key", "key_hash"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["updates", "source", "action"],
                additionalProperties: false,
              },
              {
                title: "alloc",
                type: "object",
                properties: {
                  action: { type: "string", enum: ["alloc"] },
                  updates: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
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
                              items:
                                micheline$011_PtHangz2$michelson_v1$expression,
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
                                annots: {
                                  type: "array",
                                  items: { type: "string" },
                                },
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
                              items:
                                micheline$011_PtHangz2$michelson_v1$expression,
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
                                annots: {
                                  type: "array",
                                  items: { type: "string" },
                                },
                              },
                              required: ["prim"],
                              additionalProperties: false,
                            },
                          ],
                        },
                      },
                      required: ["key", "key_hash"],
                      additionalProperties: false,
                    },
                  },
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
                required: ["value_type", "key_type", "updates", "action"],
                additionalProperties: false,
              },
            ],
          },
        },
        required: ["diff", "id", "kind"],
        additionalProperties: false,
      },
      {
        title: "sapling_state",
        type: "object",
        properties: {
          kind: { type: "string", enum: ["sapling_state"] },
          id: _011_PtHangz2$sapling_state_id,
          diff: {
            oneOf: [
              {
                title: "update",
                type: "object",
                properties: {
                  action: { type: "string", enum: ["update"] },
                  updates: {
                    type: "object",
                    properties: {
                      commitments_and_ciphertexts: {
                        type: "array",
                        items: {
                          type: "array",
                          items: [
                            sapling$transaction$commitment,
                            sapling$transaction$ciphertext,
                          ],
                          additionalItems: false,
                        },
                      },
                      nullifiers: {
                        type: "array",
                        items: sapling$transaction$nullifier,
                      },
                    },
                    required: ["nullifiers", "commitments_and_ciphertexts"],
                    additionalProperties: false,
                  },
                },
                required: ["updates", "action"],
                additionalProperties: false,
              },
              {
                title: "remove",
                type: "object",
                properties: { action: { type: "string", enum: ["remove"] } },
                required: ["action"],
                additionalProperties: false,
              },
              {
                title: "copy",
                type: "object",
                properties: {
                  action: { type: "string", enum: ["copy"] },
                  source: _011_PtHangz2$sapling_state_id,
                  updates: {
                    type: "object",
                    properties: {
                      commitments_and_ciphertexts: {
                        type: "array",
                        items: {
                          type: "array",
                          items: [
                            sapling$transaction$commitment,
                            sapling$transaction$ciphertext,
                          ],
                          additionalItems: false,
                        },
                      },
                      nullifiers: {
                        type: "array",
                        items: sapling$transaction$nullifier,
                      },
                    },
                    required: ["nullifiers", "commitments_and_ciphertexts"],
                    additionalProperties: false,
                  },
                },
                required: ["updates", "source", "action"],
                additionalProperties: false,
              },
              {
                title: "alloc",
                type: "object",
                properties: {
                  action: { type: "string", enum: ["alloc"] },
                  updates: {
                    type: "object",
                    properties: {
                      commitments_and_ciphertexts: {
                        type: "array",
                        items: {
                          type: "array",
                          items: [
                            sapling$transaction$commitment,
                            sapling$transaction$ciphertext,
                          ],
                          additionalItems: false,
                        },
                      },
                      nullifiers: {
                        type: "array",
                        items: sapling$transaction$nullifier,
                      },
                    },
                    required: ["nullifiers", "commitments_and_ciphertexts"],
                    additionalProperties: false,
                  },
                  memo_size: { type: "integer", minimum: 0, maximum: 65535 },
                },
                required: ["memo_size", "updates", "action"],
                additionalProperties: false,
              },
            ],
          },
        },
        required: ["diff", "id", "kind"],
        additionalProperties: false,
      },
    ],
  },
} as const;
export default _011_PtHangz2$lazy_storage_diff;
