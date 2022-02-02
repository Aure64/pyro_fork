import _011_PtHangz2$operation$alpha$contents from "./_011_PtHangz2$operation$alpha$contents";
import Signature from "./Signature";

const _011_PtHangz2$operation$alpha$contents_and_signature = {
  type: "object",
  properties: {
    contents: { type: "array", items: _011_PtHangz2$operation$alpha$contents },
    signature: Signature,
  },
  required: ["signature", "contents"],
  additionalProperties: false,
} as const;
export default _011_PtHangz2$operation$alpha$contents_and_signature;
