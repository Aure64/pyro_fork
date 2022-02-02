import bignum from "./bignum";
import unistring from "./unistring";
import micheline$012_Psithaca$michelson_v1$expression from "./micheline$012_Psithaca$michelson_v1$expression";
import _012_Psithaca$michelson$v1$primitives from "./_012_Psithaca$michelson$v1$primitives";

const _012_Psithaca$scripted$contracts = {
  type: "object",
  properties: {
    code: {
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
            bytes: { type: "string", pattern: "^([a-zA-Z0-9][a-zA-Z0-9])*$" },
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
            bytes: { type: "string", pattern: "^([a-zA-Z0-9][a-zA-Z0-9])*$" },
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
  required: ["storage", "code"],
  additionalProperties: false,
} as const;
export default _012_Psithaca$scripted$contracts;
