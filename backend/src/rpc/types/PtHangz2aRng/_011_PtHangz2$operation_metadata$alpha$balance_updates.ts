import _011_PtHangz2$contract_id from "./_011_PtHangz2$contract_id";
import int64 from "./int64";
import Signature$Public_key_hash from "./Signature$Public_key_hash";

const _011_PtHangz2$operation_metadata$alpha$balance_updates = {
  type: "array",
  items: {
    oneOf: [
      {
        title: "Contract",
        type: "object",
        properties: {
          kind: { type: "string", enum: ["contract"] },
          contract: _011_PtHangz2$contract_id,
          change: int64,
          origin: {
            oneOf: [
              { title: "Block_application", type: "string", enum: ["block"] },
              {
                title: "Protocol_migration",
                type: "string",
                enum: ["migration"],
              },
              { title: "Subsidy", type: "string", enum: ["subsidy"] },
            ],
          },
        },
        required: ["origin", "change", "contract", "kind"],
        additionalProperties: false,
      },
      {
        title: "Rewards",
        type: "object",
        properties: {
          kind: { type: "string", enum: ["freezer"] },
          category: { type: "string", enum: ["rewards"] },
          delegate: Signature$Public_key_hash,
          cycle: { type: "integer", minimum: -2147483648, maximum: 2147483647 },
          change: int64,
          origin: {
            oneOf: [
              { title: "Block_application", type: "string", enum: ["block"] },
              {
                title: "Protocol_migration",
                type: "string",
                enum: ["migration"],
              },
              { title: "Subsidy", type: "string", enum: ["subsidy"] },
            ],
          },
        },
        required: ["origin", "change", "cycle", "delegate", "category", "kind"],
        additionalProperties: false,
      },
      {
        title: "Fees",
        type: "object",
        properties: {
          kind: { type: "string", enum: ["freezer"] },
          category: { type: "string", enum: ["fees"] },
          delegate: Signature$Public_key_hash,
          cycle: { type: "integer", minimum: -2147483648, maximum: 2147483647 },
          change: int64,
          origin: {
            oneOf: [
              { title: "Block_application", type: "string", enum: ["block"] },
              {
                title: "Protocol_migration",
                type: "string",
                enum: ["migration"],
              },
              { title: "Subsidy", type: "string", enum: ["subsidy"] },
            ],
          },
        },
        required: ["origin", "change", "cycle", "delegate", "category", "kind"],
        additionalProperties: false,
      },
      {
        title: "Deposits",
        type: "object",
        properties: {
          kind: { type: "string", enum: ["freezer"] },
          category: { type: "string", enum: ["deposits"] },
          delegate: Signature$Public_key_hash,
          cycle: { type: "integer", minimum: -2147483648, maximum: 2147483647 },
          change: int64,
          origin: {
            oneOf: [
              { title: "Block_application", type: "string", enum: ["block"] },
              {
                title: "Protocol_migration",
                type: "string",
                enum: ["migration"],
              },
              { title: "Subsidy", type: "string", enum: ["subsidy"] },
            ],
          },
        },
        required: ["origin", "change", "cycle", "delegate", "category", "kind"],
        additionalProperties: false,
      },
    ],
  },
} as const;
export default _011_PtHangz2$operation_metadata$alpha$balance_updates;
