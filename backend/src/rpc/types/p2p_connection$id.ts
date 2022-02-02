import p2p_address from "./p2p_address";

const p2p_connection$id = {
  description:
    "The identifier for a p2p connection. It includes an address and a port number.",
  type: "object",
  properties: {
    addr: p2p_address,
    port: { type: "integer", minimum: 0, maximum: 65535 },
  },
  required: ["addr"],
  additionalProperties: false,
} as const;
export default p2p_connection$id;
