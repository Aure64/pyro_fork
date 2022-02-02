import _012_Psithaca$operation$alpha$operation_contents_and_result from "./_012_Psithaca$operation$alpha$operation_contents_and_result";
import Signature from "./Signature";
import _012_Psithaca$operation$alpha$contents from "./_012_Psithaca$operation$alpha$contents";

const _012_Psithaca$operation$alpha$operation_with_metadata = {
  oneOf: [
    {
      title: "Operation_with_metadata",
      type: "object",
      properties: {
        contents: {
          type: "array",
          items: _012_Psithaca$operation$alpha$operation_contents_and_result,
        },
        signature: Signature,
      },
      required: ["contents"],
      additionalProperties: false,
    },
    {
      title: "Operation_without_metadata",
      type: "object",
      properties: {
        contents: {
          type: "array",
          items: _012_Psithaca$operation$alpha$contents,
        },
        signature: Signature,
      },
      required: ["contents"],
      additionalProperties: false,
    },
  ],
} as const;
export default _012_Psithaca$operation$alpha$operation_with_metadata;
