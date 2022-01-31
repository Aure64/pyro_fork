const p2p_version = {
  description: "A version number for the p2p layer.",
  type: "integer",
  minimum: 0,
  maximum: 65535,
} as const;
export default p2p_version;
