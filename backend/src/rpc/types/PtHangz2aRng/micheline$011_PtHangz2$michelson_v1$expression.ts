import bignum from "./bignum";
import unistring from "./unistring";
import micheline$011_PtHangz2$michelson_v1$expression from "./micheline$011_PtHangz2$michelson_v1$expression";
import _011_PtHangz2$michelson$v1$primitives from "./_011_PtHangz2$michelson$v1$primitives";

const micheline$011_PtHangz2$michelson_v1$expression = {
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
} as const;
export default micheline$011_PtHangz2$michelson_v1$expression;
