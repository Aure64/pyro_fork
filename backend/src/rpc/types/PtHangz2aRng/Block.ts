import bignum from "./bignum";

import block_hash from "./block_hash";

import timestamp$protocol from "./timestamp$protocol";

import Operation_list_list_hash from "./Operation_list_list_hash";

import fitness from "./fitness";

import Context_hash from "./Context_hash";

import cycle_nonce from "./cycle_nonce";

import Signature from "./Signature";

import _011_PtHangz2$block_header$alpha$full_header from "./_011_PtHangz2$block_header$alpha$full_header";

import unistring from "./unistring";

import _011_PtHangz2$entrypoint from "./_011_PtHangz2$entrypoint";

import _011_PtHangz2$error from "./_011_PtHangz2$error";

import _011_PtHangz2$inlined$endorsement$contents from "./_011_PtHangz2$inlined$endorsement$contents";

import _011_PtHangz2$inlined$endorsement from "./_011_PtHangz2$inlined$endorsement";

import _011_PtHangz2$big_map_id from "./_011_PtHangz2$big_map_id";

import script_expr from "./script_expr";

import micheline$011_PtHangz2$michelson_v1$expression from "./micheline$011_PtHangz2$michelson_v1$expression";

import _011_PtHangz2$michelson$v1$primitives from "./_011_PtHangz2$michelson$v1$primitives";

import _011_PtHangz2$sapling_state_id from "./_011_PtHangz2$sapling_state_id";

import sapling$transaction$commitment from "./sapling$transaction$commitment";

import sapling$transaction$ciphertext from "./sapling$transaction$ciphertext";

import sapling$transaction$nullifier from "./sapling$transaction$nullifier";

import _011_PtHangz2$lazy_storage_diff from "./_011_PtHangz2$lazy_storage_diff";

import positive_bignum from "./positive_bignum";

import Ed25519$Public_key_hash from "./Ed25519$Public_key_hash";

import Signature$Public_key_hash from "./Signature$Public_key_hash";

import Protocol_hash from "./Protocol_hash";

import _011_PtHangz2$mutez from "./_011_PtHangz2$mutez";

import Signature$Public_key from "./Signature$Public_key";

import _011_PtHangz2$contract_id from "./_011_PtHangz2$contract_id";

import _011_PtHangz2$scripted$contracts from "./_011_PtHangz2$scripted$contracts";

import _011_PtHangz2$operation$alpha$contents from "./_011_PtHangz2$operation$alpha$contents";

import _011_PtHangz2$operation$alpha$contents_and_signature from "./_011_PtHangz2$operation$alpha$contents_and_signature";

import _011_PtHangz2$operation$alpha$operation_result$reveal from "./_011_PtHangz2$operation$alpha$operation_result$reveal";

import _011_PtHangz2$operation$alpha$operation_result$transaction from "./_011_PtHangz2$operation$alpha$operation_result$transaction";

import _011_PtHangz2$operation$alpha$operation_result$origination from "./_011_PtHangz2$operation$alpha$operation_result$origination";

import _011_PtHangz2$operation$alpha$operation_result$delegation from "./_011_PtHangz2$operation$alpha$operation_result$delegation";

import _011_PtHangz2$operation$alpha$operation_result$register_global_constant from "./_011_PtHangz2$operation$alpha$operation_result$register_global_constant";

import _011_PtHangz2$operation$alpha$internal_operation_result from "./_011_PtHangz2$operation$alpha$internal_operation_result";

import _011_PtHangz2$operation_metadata$alpha$balance_updates from "./_011_PtHangz2$operation_metadata$alpha$balance_updates";

import _011_PtHangz2$operation$alpha$operation_contents_and_result from "./_011_PtHangz2$operation$alpha$operation_contents_and_result";

import _011_PtHangz2$operation$alpha$operation_with_metadata from "./_011_PtHangz2$operation$alpha$operation_with_metadata";

import _011_PtHangz2$operation$alpha$successful_manager_operation_result from "./_011_PtHangz2$operation$alpha$successful_manager_operation_result";

import int64 from "./int64";

import test_chain_status from "./test_chain_status";

import block_header_metadata from "./block_header_metadata";

import Chain_id from "./Chain_id";

import Operation_hash from "./Operation_hash";

import operation from "./operation";

import raw_block_header from "./raw_block_header";

import sapling$DH$epk from "./sapling$DH$epk";

import sapling$transaction$commitment_value from "./sapling$transaction$commitment_value";

const schema = {
  $schema: "http://json-schema.org/draft-04/schema#",
  type: "object",
  properties: {
    protocol: {
      type: "string",
      enum: ["PtHangz2aRngywmSRGGvrcTyMbbdpWdpFKuS4uMWxg2RaH9i1qx"],
    },
    chain_id: Chain_id,
    hash: block_hash,
    header: raw_block_header,
    metadata: block_header_metadata,
    operations: { type: "array", items: { type: "array", items: operation } },
  },
  required: ["operations", "header", "hash", "chain_id", "protocol"],
  additionalProperties: false,
} as const;

import { FromSchema } from "json-schema-to-ts";
type T = FromSchema<typeof schema>;
export default T;
