const _011_PtHangz2$inlined$endorsement$contents = {
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
  ],
} as const;
export default _011_PtHangz2$inlined$endorsement$contents;
