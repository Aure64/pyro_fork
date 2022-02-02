import positive_bignum from "./positive_bignum";
import _011_PtHangz2$error from "./_011_PtHangz2$error";

const _011_PtHangz2$operation$alpha$operation_result$delegation = {
  oneOf: [
    {
      title: "Applied",
      type: "object",
      properties: {
        status: { type: "string", enum: ["applied"] },
        consumed_gas: positive_bignum,
        consumed_milligas: positive_bignum,
      },
      required: ["status"],
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
        consumed_gas: positive_bignum,
        consumed_milligas: positive_bignum,
      },
      required: ["status"],
      additionalProperties: false,
    },
  ],
} as const;
export default _011_PtHangz2$operation$alpha$operation_result$delegation;
