import Chain_id from "./Chain_id";
import Operation_hash from "./Operation_hash";
import block_hash from "./block_hash";
import _011_PtHangz2$operation$alpha$operation_contents_and_result from "./_011_PtHangz2$operation$alpha$operation_contents_and_result";
import Signature from "./Signature";
import _011_PtHangz2$operation$alpha$contents from "./_011_PtHangz2$operation$alpha$contents";

const operation = {
  oneOf: [
    {
      description: "An operation's shell header.",
      type: "object",
      properties: {
        protocol: {
          type: "string",
          enum: ["PtHangz2aRngywmSRGGvrcTyMbbdpWdpFKuS4uMWxg2RaH9i1qx"],
        },
        chain_id: Chain_id,
        hash: Operation_hash,
        branch: block_hash,
        contents: {
          type: "array",
          items: _011_PtHangz2$operation$alpha$operation_contents_and_result,
        },
        signature: Signature,
      },
      required: ["contents", "branch", "hash", "chain_id", "protocol"],
      additionalProperties: false,
    },
    {
      description: "An operation's shell header.",
      type: "object",
      properties: {
        protocol: {
          type: "string",
          enum: ["PtHangz2aRngywmSRGGvrcTyMbbdpWdpFKuS4uMWxg2RaH9i1qx"],
        },
        chain_id: Chain_id,
        hash: Operation_hash,
        branch: block_hash,
        contents: {
          type: "array",
          items: _011_PtHangz2$operation$alpha$contents,
        },
        signature: Signature,
      },
      required: ["contents", "branch", "hash", "chain_id", "protocol"],
      additionalProperties: false,
    },
    {
      description: "An operation's shell header.",
      type: "object",
      properties: {
        protocol: {
          type: "string",
          enum: ["PtHangz2aRngywmSRGGvrcTyMbbdpWdpFKuS4uMWxg2RaH9i1qx"],
        },
        chain_id: Chain_id,
        hash: Operation_hash,
        branch: block_hash,
        contents: {
          type: "array",
          items: _011_PtHangz2$operation$alpha$contents,
        },
        signature: Signature,
      },
      required: [
        "signature",
        "contents",
        "branch",
        "hash",
        "chain_id",
        "protocol",
      ],
      additionalProperties: false,
    },
  ],
} as const;
export default operation;
