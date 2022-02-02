import Chain_id from "./Chain_id";
import Operation_hash from "./Operation_hash";
import block_hash from "./block_hash";
import _012_Psithaca$operation$alpha$operation_contents_and_result from "./_012_Psithaca$operation$alpha$operation_contents_and_result";
import Signature from "./Signature";
import _012_Psithaca$operation$alpha$contents from "./_012_Psithaca$operation$alpha$contents";

const operation = {
  oneOf: [
    {
      description: "An operation's shell header.",
      type: "object",
      properties: {
        protocol: {
          type: "string",
          enum: ["Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A"],
        },
        chain_id: Chain_id,
        hash: Operation_hash,
        branch: block_hash,
        contents: {
          type: "array",
          items: _012_Psithaca$operation$alpha$operation_contents_and_result,
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
          enum: ["Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A"],
        },
        chain_id: Chain_id,
        hash: Operation_hash,
        branch: block_hash,
        contents: {
          type: "array",
          items: _012_Psithaca$operation$alpha$contents,
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
          enum: ["Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A"],
        },
        chain_id: Chain_id,
        hash: Operation_hash,
        branch: block_hash,
        contents: {
          type: "array",
          items: _012_Psithaca$operation$alpha$contents,
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
