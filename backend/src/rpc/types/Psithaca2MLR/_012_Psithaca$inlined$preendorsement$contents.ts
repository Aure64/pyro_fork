import value_hash from "./value_hash";

const _012_Psithaca$inlined$preendorsement$contents = {
  oneOf: [
    {
      title: "Preendorsement",
      type: "object",
      properties: {
        kind: { type: "string", enum: ["preendorsement"] },
        slot: { type: "integer", minimum: 0, maximum: 65535 },
        level: { type: "integer", minimum: -2147483648, maximum: 2147483647 },
        round: { type: "integer", minimum: -2147483648, maximum: 2147483647 },
        block_payload_hash: value_hash,
      },
      required: ["block_payload_hash", "round", "level", "slot", "kind"],
      additionalProperties: false,
    },
  ],
} as const;
export default _012_Psithaca$inlined$preendorsement$contents;
