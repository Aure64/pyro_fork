import block_hash from "./block_hash";
import _012_Psithaca$inlined$preendorsement$contents from "./_012_Psithaca$inlined$preendorsement$contents";
import Signature from "./Signature";

const _012_Psithaca$inlined$preendorsement = {
  description: "An operation's shell header.",
  type: "object",
  properties: {
    branch: block_hash,
    operations: _012_Psithaca$inlined$preendorsement$contents,
    signature: Signature,
  },
  required: ["operations", "branch"],
  additionalProperties: false,
} as const;
export default _012_Psithaca$inlined$preendorsement;
