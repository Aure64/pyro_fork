import _012_Psithaca$operation_metadata$alpha$balance_updates from "./_012_Psithaca$operation_metadata$alpha$balance_updates";
import positive_bignum from "./positive_bignum";
import bignum from "./bignum";
import script_expr from "./script_expr";
import _012_Psithaca$error from "./_012_Psithaca$error";

const _012_Psithaca$operation$alpha$operation_result$register_global_constant =
  {
    oneOf: [
      {
        title: "Applied",
        type: "object",
        properties: {
          status: { type: "string", enum: ["applied"] },
          balance_updates:
            _012_Psithaca$operation_metadata$alpha$balance_updates,
          consumed_gas: positive_bignum,
          storage_size: bignum,
          global_address: script_expr,
        },
        required: [
          "global_address",
          "storage_size",
          "consumed_gas",
          "balance_updates",
          "status",
        ],
        additionalProperties: false,
      },
      {
        title: "Failed",
        type: "object",
        properties: {
          status: { type: "string", enum: ["failed"] },
          errors: { type: "array", items: _012_Psithaca$error },
        },
        required: ["errors", "status"],
        additionalProperties: false,
      },
      {
        title: "Skipped",
        type: "object",
        properties: { status: { type: "string", enum: ["skipped"] } },
        required: ["status"],
        additionalProperties: false,
      },
      {
        title: "Backtracked",
        type: "object",
        properties: {
          status: { type: "string", enum: ["backtracked"] },
          errors: { type: "array", items: _012_Psithaca$error },
          balance_updates:
            _012_Psithaca$operation_metadata$alpha$balance_updates,
          consumed_gas: positive_bignum,
          storage_size: bignum,
          global_address: script_expr,
        },
        required: [
          "global_address",
          "storage_size",
          "consumed_gas",
          "balance_updates",
          "status",
        ],
        additionalProperties: false,
      },
    ],
  } as const;
export default _012_Psithaca$operation$alpha$operation_result$register_global_constant;
