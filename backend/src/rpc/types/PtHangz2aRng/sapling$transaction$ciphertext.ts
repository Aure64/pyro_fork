import sapling$transaction$commitment_value from "./sapling$transaction$commitment_value";
import sapling$DH$epk from "./sapling$DH$epk";

const sapling$transaction$ciphertext = {
  type: "object",
  properties: {
    cv: sapling$transaction$commitment_value,
    epk: sapling$DH$epk,
    payload_enc: { type: "string", pattern: "^([a-zA-Z0-9][a-zA-Z0-9])*$" },
    nonce_enc: { type: "string", pattern: "^([a-zA-Z0-9][a-zA-Z0-9])*$" },
    payload_out: { type: "string", pattern: "^([a-zA-Z0-9][a-zA-Z0-9])*$" },
    nonce_out: { type: "string", pattern: "^([a-zA-Z0-9][a-zA-Z0-9])*$" },
  },
  required: [
    "nonce_out",
    "payload_out",
    "nonce_enc",
    "payload_enc",
    "epk",
    "cv",
  ],
  additionalProperties: false,
} as const;
export default sapling$transaction$ciphertext;
