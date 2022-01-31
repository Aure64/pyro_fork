const unistring = {
  title: "Universal string representation",
  description:
    "Either a plain UTF8 string, or a sequence of bytes for strings that contain invalid byte sequences.",
  oneOf: [
    { type: "string" },
    {
      type: "object",
      properties: {
        invalid_utf8_string: {
          type: "array",
          items: { type: "integer", minimum: 0, maximum: 255 },
        },
      },
      required: ["invalid_utf8_string"],
      additionalProperties: false,
    },
  ],
} as const;
export default unistring;
