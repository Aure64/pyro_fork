import Protocol_hash from "./Protocol_hash";
import timestamp$protocol from "./timestamp$protocol";
import Chain_id from "./Chain_id";
import block_hash from "./block_hash";

const test_chain_status = {
  description:
    "The status of the test chain: not_running (there is no test chain at the moment), forking (the test chain is being setup), running (the test chain is running).",
  oneOf: [
    {
      title: "Not_running",
      type: "object",
      properties: { status: { type: "string", enum: ["not_running"] } },
      required: ["status"],
      additionalProperties: false,
    },
    {
      title: "Forking",
      type: "object",
      properties: {
        status: { type: "string", enum: ["forking"] },
        protocol: Protocol_hash,
        expiration: timestamp$protocol,
      },
      required: ["expiration", "protocol", "status"],
      additionalProperties: false,
    },
    {
      title: "Running",
      type: "object",
      properties: {
        status: { type: "string", enum: ["running"] },
        chain_id: Chain_id,
        genesis: block_hash,
        protocol: Protocol_hash,
        expiration: timestamp$protocol,
      },
      required: ["expiration", "protocol", "genesis", "chain_id", "status"],
      additionalProperties: false,
    },
  ],
} as const;
export default test_chain_status;
