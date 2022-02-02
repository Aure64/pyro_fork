import positive_bignum from "./positive_bignum";
import _012_Psithaca$error from "./_012_Psithaca$error";

const _012_Psithaca$operation$alpha$operation_result$reveal = {
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
        consumed_gas: positive_bignum,
        consumed_milligas: positive_bignum,
      },
      required: ["status"],
      additionalProperties: false,
    },
  ],
} as const;
export default _012_Psithaca$operation$alpha$operation_result$reveal;
