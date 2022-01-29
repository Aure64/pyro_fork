const chain_status = {
  description:
    "If 'unsynced', the node is not currently synchronized with of its peers (it is probably still bootstrapping and its head is lagging behind the chain's).\nIf 'synced', the node considers itself synchronized with its peers and the current head timestamp is recent.\nIf 'stuck', the node considers itself synchronized with its peers but the chain seems to be halted from its viewpoint.",
  type: "string",
  enum: ["stuck", "synced", "unsynced"],
} as const;

const schema = {
  $schema: "http://json-schema.org/draft-04/schema#",
  type: "object",
  properties: { bootstrapped: { type: "boolean" }, sync_state: chain_status },
  required: ["sync_state", "bootstrapped"],
  additionalProperties: false,
} as const;

import { FromSchema } from "json-schema-to-ts";
type T = FromSchema<typeof schema>;
export default T;
