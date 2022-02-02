import _012_Psithaca$operation$alpha$contents from "./_012_Psithaca$operation$alpha$contents";
import Signature from "./Signature";

const _012_Psithaca$operation$alpha$contents_and_signature = {
  type: "object",
  properties: {
    contents: { type: "array", items: _012_Psithaca$operation$alpha$contents },
    signature: Signature,
  },
  required: ["signature", "contents"],
  additionalProperties: false,
} as const;
export default _012_Psithaca$operation$alpha$contents_and_signature;
