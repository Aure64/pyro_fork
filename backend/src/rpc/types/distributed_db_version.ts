const distributed_db_version = {
  description: "A version number for the distributed DB protocol",
  type: "integer",
  minimum: 0,
  maximum: 65535,
} as const;
export default distributed_db_version;
