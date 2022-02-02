import block_hash from "./block_hash";
import _011_PtHangz2$inlined$endorsement$contents from "./_011_PtHangz2$inlined$endorsement$contents";
import Signature from "./Signature";

const _011_PtHangz2$inlined$endorsement = {
  description: "An operation's shell header.",
  type: "object",
  properties: {
    branch: block_hash,
    operations: _011_PtHangz2$inlined$endorsement$contents,
    signature: Signature,
  },
  required: ["operations", "branch"],
  additionalProperties: false,
} as const;
export default _011_PtHangz2$inlined$endorsement;
