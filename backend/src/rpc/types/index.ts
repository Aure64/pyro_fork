export { NetworkConnection } from "./gen/NetworkConnection";
export { TezosVersion } from "./gen/TezosVersion";
export { BootstrappedStatus } from "./gen/BootstrappedStatus";
export { ShellHeader as BlockHeader } from "./gen/BlockHeader";
export { Delegate } from "./gen/Delegate";

import { EndorsingRights as EndorsingRightsH } from "./gen/PtHangz2aRng/EndorsingRights";
import { EndorsingRights as EndorsingRightsI } from "./gen/Psithaca2MLR/EndorsingRights";
import { Constants as ConstantsH } from "./gen/PtHangz2aRng/Constants";
import { Constants as ConstantsI } from "./gen/Psithaca2MLR/Constants";
import { BakingRights as BakingRightsH } from "./gen/PtHangz2aRng/BakingRights";
import { BakingRights as BakingRightsI } from "./gen/Psithaca2MLR/BakingRights";
import { Block as BlockH } from "./gen/PtHangz2aRng/Block";
import { Block as BlockI } from "./gen/Psithaca2MLR/Block";

import { Operation as OperationH } from "./gen/PtHangz2aRng/Block";
import { Operation as OperationI } from "./gen/Psithaca2MLR/Block";

import {
  DoubleBakingEvidence1 as DoubleBakingEvidenceH,
  DoubleEndorsementEvidence1 as DoubleEndorsementEvidenceH,
  EndorsementWithSlot1 as EndorsementWithSlotH,
} from "./gen/PtHangz2aRng/Block";

// export type Block = BlockH | BlockI;
// export type EndorsingRight =
//   | EndorsingRightsH[number]
//   | EndorsingRightsI[number];
// export type BakingRight = BakingRightsH[number] | BakingRightsI[number];
// export type Constants = ConstantsH | ConstantsI;

export type Block = BlockH;
export { BlockH };

export type OperationEntry = OperationH;
export type DoubleBakingEvidence = DoubleBakingEvidenceH;
export type DoubleEndorsementEvidence = DoubleEndorsementEvidenceH;
export type EndorsementWithSlot = EndorsementWithSlotH;

export type EndorsingRight = EndorsingRightsH[number];
export type BakingRight = BakingRightsH[number];
export type Constants = ConstantsH;

export enum OpKind {
  ORIGINATION = "origination",
  DELEGATION = "delegation",
  REVEAL = "reveal",
  TRANSACTION = "transaction",
  ACTIVATION = "activate_account",
  ENDORSEMENT = "endorsement",
  ENDORSEMENT_WITH_SLOT = "endorsement_with_slot",
  SEED_NONCE_REVELATION = "seed_nonce_revelation",
  DOUBLE_ENDORSEMENT_EVIDENCE = "double_endorsement_evidence",
  DOUBLE_BAKING_EVIDENCE = "double_baking_evidence",
  PROPOSALS = "proposals",
  BALLOT = "ballot",
  FAILING_NOOP = "failing_noop",
}

export type TzAddress = string;
export type URL = string;
