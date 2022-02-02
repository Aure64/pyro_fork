import _012_Psithaca$contract_id from "./_012_Psithaca$contract_id";
import int64 from "./int64";
import Signature$Public_key_hash from "./Signature$Public_key_hash";
import Blinded_public_key_hash from "./Blinded_public_key_hash";

const _012_Psithaca$operation_metadata$alpha$balance_updates = {
  type: "array",
  items: {
    oneOf: [
      {
        title: "Contract",
        type: "object",
        properties: {
          kind: { type: "string", enum: ["contract"] },
          contract: _012_Psithaca$contract_id,
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
              { title: "Simulation", type: "string", enum: ["simulation"] },
            ],
          },
        },
        required: ["origin", "change", "contract", "kind"],
        additionalProperties: false,
      },
      {
        title: "Legacy_rewards",
        type: "object",
        properties: {
          kind: { type: "string", enum: ["freezer"] },
          category: { type: "string", enum: ["legacy_rewards"] },
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
              { title: "Simulation", type: "string", enum: ["simulation"] },
            ],
          },
        },
        required: ["origin", "change", "cycle", "delegate", "category", "kind"],
        additionalProperties: false,
      },
      {
        title: "Block_fees",
        type: "object",
        properties: {
          kind: { type: "string", enum: ["accumulator"] },
          category: { type: "string", enum: ["block fees"] },
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
              { title: "Simulation", type: "string", enum: ["simulation"] },
            ],
          },
        },
        required: ["origin", "change", "category", "kind"],
        additionalProperties: false,
      },
      {
        title: "Legacy_deposits",
        type: "object",
        properties: {
          kind: { type: "string", enum: ["freezer"] },
          category: { type: "string", enum: ["legacy_deposits"] },
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
              { title: "Simulation", type: "string", enum: ["simulation"] },
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
              { title: "Simulation", type: "string", enum: ["simulation"] },
            ],
          },
        },
        required: ["origin", "change", "delegate", "category", "kind"],
        additionalProperties: false,
      },
      {
        title: "Nonce_revelation_rewards",
        type: "object",
        properties: {
          kind: { type: "string", enum: ["minted"] },
          category: { type: "string", enum: ["nonce revelation rewards"] },
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
              { title: "Simulation", type: "string", enum: ["simulation"] },
            ],
          },
        },
        required: ["origin", "change", "category", "kind"],
        additionalProperties: false,
      },
      {
        title: "Double_signing_evidence_rewards",
        type: "object",
        properties: {
          kind: { type: "string", enum: ["minted"] },
          category: {
            type: "string",
            enum: ["double signing evidence rewards"],
          },
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
              { title: "Simulation", type: "string", enum: ["simulation"] },
            ],
          },
        },
        required: ["origin", "change", "category", "kind"],
        additionalProperties: false,
      },
      {
        title: "Endorsing_rewards",
        type: "object",
        properties: {
          kind: { type: "string", enum: ["minted"] },
          category: { type: "string", enum: ["endorsing rewards"] },
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
              { title: "Simulation", type: "string", enum: ["simulation"] },
            ],
          },
        },
        required: ["origin", "change", "category", "kind"],
        additionalProperties: false,
      },
      {
        title: "Baking_rewards",
        type: "object",
        properties: {
          kind: { type: "string", enum: ["minted"] },
          category: { type: "string", enum: ["baking rewards"] },
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
              { title: "Simulation", type: "string", enum: ["simulation"] },
            ],
          },
        },
        required: ["origin", "change", "category", "kind"],
        additionalProperties: false,
      },
      {
        title: "Baking_bonuses",
        type: "object",
        properties: {
          kind: { type: "string", enum: ["minted"] },
          category: { type: "string", enum: ["baking bonuses"] },
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
              { title: "Simulation", type: "string", enum: ["simulation"] },
            ],
          },
        },
        required: ["origin", "change", "category", "kind"],
        additionalProperties: false,
      },
      {
        title: "Legacy_fees",
        type: "object",
        properties: {
          kind: { type: "string", enum: ["freezer"] },
          category: { type: "string", enum: ["legacy_fees"] },
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
              { title: "Simulation", type: "string", enum: ["simulation"] },
            ],
          },
        },
        required: ["origin", "change", "cycle", "delegate", "category", "kind"],
        additionalProperties: false,
      },
      {
        title: "Storage_fees",
        type: "object",
        properties: {
          kind: { type: "string", enum: ["burned"] },
          category: { type: "string", enum: ["storage fees"] },
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
              { title: "Simulation", type: "string", enum: ["simulation"] },
            ],
          },
        },
        required: ["origin", "change", "category", "kind"],
        additionalProperties: false,
      },
      {
        title: "Double_signing_punishments",
        type: "object",
        properties: {
          kind: { type: "string", enum: ["burned"] },
          category: { type: "string", enum: ["punishments"] },
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
              { title: "Simulation", type: "string", enum: ["simulation"] },
            ],
          },
        },
        required: ["origin", "change", "category", "kind"],
        additionalProperties: false,
      },
      {
        title: "Lost_endorsing_rewards",
        type: "object",
        properties: {
          kind: { type: "string", enum: ["burned"] },
          category: { type: "string", enum: ["lost endorsing rewards"] },
          delegate: Signature$Public_key_hash,
          participation: { type: "boolean" },
          revelation: { type: "boolean" },
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
              { title: "Simulation", type: "string", enum: ["simulation"] },
            ],
          },
        },
        required: [
          "origin",
          "change",
          "revelation",
          "participation",
          "delegate",
          "category",
          "kind",
        ],
        additionalProperties: false,
      },
      {
        title: "Liquidity_baking_subsidies",
        type: "object",
        properties: {
          kind: { type: "string", enum: ["minted"] },
          category: { type: "string", enum: ["subsidy"] },
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
              { title: "Simulation", type: "string", enum: ["simulation"] },
            ],
          },
        },
        required: ["origin", "change", "category", "kind"],
        additionalProperties: false,
      },
      {
        title: "Burned",
        type: "object",
        properties: {
          kind: { type: "string", enum: ["burned"] },
          category: { type: "string", enum: ["burned"] },
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
              { title: "Simulation", type: "string", enum: ["simulation"] },
            ],
          },
        },
        required: ["origin", "change", "category", "kind"],
        additionalProperties: false,
      },
      {
        title: "Commitments",
        type: "object",
        properties: {
          kind: { type: "string", enum: ["commitment"] },
          category: { type: "string", enum: ["commitment"] },
          committer: Blinded_public_key_hash,
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
              { title: "Simulation", type: "string", enum: ["simulation"] },
            ],
          },
        },
        required: ["origin", "change", "committer", "category", "kind"],
        additionalProperties: false,
      },
      {
        title: "Bootstrap",
        type: "object",
        properties: {
          kind: { type: "string", enum: ["minted"] },
          category: { type: "string", enum: ["bootstrap"] },
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
              { title: "Simulation", type: "string", enum: ["simulation"] },
            ],
          },
        },
        required: ["origin", "change", "category", "kind"],
        additionalProperties: false,
      },
      {
        title: "Invoice",
        type: "object",
        properties: {
          kind: { type: "string", enum: ["minted"] },
          category: { type: "string", enum: ["invoice"] },
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
              { title: "Simulation", type: "string", enum: ["simulation"] },
            ],
          },
        },
        required: ["origin", "change", "category", "kind"],
        additionalProperties: false,
      },
      {
        title: "Initial_commitments",
        type: "object",
        properties: {
          kind: { type: "string", enum: ["minted"] },
          category: { type: "string", enum: ["commitment"] },
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
              { title: "Simulation", type: "string", enum: ["simulation"] },
            ],
          },
        },
        required: ["origin", "change", "category", "kind"],
        additionalProperties: false,
      },
      {
        title: "Minted",
        type: "object",
        properties: {
          kind: { type: "string", enum: ["minted"] },
          category: { type: "string", enum: ["minted"] },
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
              { title: "Simulation", type: "string", enum: ["simulation"] },
            ],
          },
        },
        required: ["origin", "change", "category", "kind"],
        additionalProperties: false,
      },
    ],
  },
} as const;
export default _012_Psithaca$operation_metadata$alpha$balance_updates;
