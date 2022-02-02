import _011_PtHangz2$operation_metadata$alpha$balance_updates from "./_011_PtHangz2$operation_metadata$alpha$balance_updates";
import positive_bignum from "./positive_bignum";
import bignum from "./bignum";
import script_expr from "./script_expr";
import _011_PtHangz2$error from "./_011_PtHangz2$error";

const _011_PtHangz2$operation$alpha$operation_result$register_global_constant =
  {
    oneOf: [
      {
        title: "Applied",
        type: "object",
        properties: {
          status: { type: "string", enum: ["applied"] },
          balance_updates:
            _011_PtHangz2$operation_metadata$alpha$balance_updates,
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
          errors: { type: "array", items: _011_PtHangz2$error },
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
          errors: { type: "array", items: _011_PtHangz2$error },
          balance_updates:
            _011_PtHangz2$operation_metadata$alpha$balance_updates,
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
export default _011_PtHangz2$operation$alpha$operation_result$register_global_constant;
