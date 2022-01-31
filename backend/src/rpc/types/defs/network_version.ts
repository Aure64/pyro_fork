import distributed_db_version$name from "./distributed_db_version$name";
import distributed_db_version from "./distributed_db_version";
import p2p_version from "./p2p_version";

const network_version = {
  description:
    "A version number for the network protocol (includes distributed DB version and p2p version)",
  type: "object",
  properties: {
    chain_name: distributed_db_version$name,
    distributed_db_version: distributed_db_version,
    p2p_version: p2p_version,
  },
  required: ["p2p_version", "distributed_db_version", "chain_name"],
  additionalProperties: false,
} as const;
export default network_version;
