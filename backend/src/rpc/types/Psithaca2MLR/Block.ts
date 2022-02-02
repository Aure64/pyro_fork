import bignum from "./bignum";

import block_hash from "./block_hash";

import timestamp$protocol from "./timestamp$protocol";

import Operation_list_list_hash from "./Operation_list_list_hash";

import fitness from "./fitness";

import Context_hash from "./Context_hash";

import value_hash from "./value_hash";

import cycle_nonce from "./cycle_nonce";

import Signature from "./Signature";

import _012_Psithaca$block_header$alpha$full_header from "./_012_Psithaca$block_header$alpha$full_header";

import unistring from "./unistring";

import _012_Psithaca$entrypoint from "./_012_Psithaca$entrypoint";

import _012_Psithaca$error from "./_012_Psithaca$error";

import _012_Psithaca$inlined$endorsement_mempool$contents from "./_012_Psithaca$inlined$endorsement_mempool$contents";

import _012_Psithaca$inlined$endorsement from "./_012_Psithaca$inlined$endorsement";

import _012_Psithaca$inlined$preendorsement$contents from "./_012_Psithaca$inlined$preendorsement$contents";

import _012_Psithaca$inlined$preendorsement from "./_012_Psithaca$inlined$preendorsement";

import _012_Psithaca$big_map_id from "./_012_Psithaca$big_map_id";

import script_expr from "./script_expr";

import micheline$012_Psithaca$michelson_v1$expression from "./micheline$012_Psithaca$michelson_v1$expression";

import _012_Psithaca$michelson$v1$primitives from "./_012_Psithaca$michelson$v1$primitives";

import _012_Psithaca$sapling_state_id from "./_012_Psithaca$sapling_state_id";

import sapling$transaction$commitment from "./sapling$transaction$commitment";

import sapling$transaction$ciphertext from "./sapling$transaction$ciphertext";

import sapling$transaction$nullifier from "./sapling$transaction$nullifier";

import _012_Psithaca$lazy_storage_diff from "./_012_Psithaca$lazy_storage_diff";

import positive_bignum from "./positive_bignum";

import Ed25519$Public_key_hash from "./Ed25519$Public_key_hash";

import Signature$Public_key_hash from "./Signature$Public_key_hash";

import Protocol_hash from "./Protocol_hash";

import _012_Psithaca$mutez from "./_012_Psithaca$mutez";

import Signature$Public_key from "./Signature$Public_key";

import _012_Psithaca$contract_id from "./_012_Psithaca$contract_id";

import _012_Psithaca$scripted$contracts from "./_012_Psithaca$scripted$contracts";

import _012_Psithaca$operation$alpha$contents from "./_012_Psithaca$operation$alpha$contents";

import _012_Psithaca$operation$alpha$contents_and_signature from "./_012_Psithaca$operation$alpha$contents_and_signature";

import _012_Psithaca$operation$alpha$operation_result$reveal from "./_012_Psithaca$operation$alpha$operation_result$reveal";

import _012_Psithaca$operation$alpha$operation_result$transaction from "./_012_Psithaca$operation$alpha$operation_result$transaction";

import _012_Psithaca$operation$alpha$operation_result$origination from "./_012_Psithaca$operation$alpha$operation_result$origination";

import _012_Psithaca$operation$alpha$operation_result$delegation from "./_012_Psithaca$operation$alpha$operation_result$delegation";

import _012_Psithaca$operation$alpha$operation_result$register_global_constant from "./_012_Psithaca$operation$alpha$operation_result$register_global_constant";

import _012_Psithaca$operation$alpha$operation_result$set_deposits_limit from "./_012_Psithaca$operation$alpha$operation_result$set_deposits_limit";

import _012_Psithaca$operation$alpha$internal_operation_result from "./_012_Psithaca$operation$alpha$internal_operation_result";

import _012_Psithaca$operation_metadata$alpha$balance_updates from "./_012_Psithaca$operation_metadata$alpha$balance_updates";

import _012_Psithaca$operation$alpha$operation_contents_and_result from "./_012_Psithaca$operation$alpha$operation_contents_and_result";

import _012_Psithaca$operation$alpha$operation_with_metadata from "./_012_Psithaca$operation$alpha$operation_with_metadata";

import _012_Psithaca$operation$alpha$successful_manager_operation_result from "./_012_Psithaca$operation$alpha$successful_manager_operation_result";

import int64 from "./int64";

import Blinded_public_key_hash from "./Blinded_public_key_hash";

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
      enum: ["Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A"],
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
