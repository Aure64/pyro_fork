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

import {
  DoubleBakingEvidence1 as DoubleBakingEvidenceI,
  DoubleEndorsementEvidence1 as DoubleEndorsementEvidenceI,
  Endorsement1 as EndorsementWithSlotI,
} from "./gen/Psithaca2MLR/Block";

export { BlockH, BlockI };
export type Block = BlockH | BlockI;

export type EndorsingRightH = EndorsingRightsH[number];
export type EndorsingRightI = EndorsingRightsI[number];
export type { EndorsingRightsH, EndorsingRightsI };
export type EndorsingRight = EndorsingRightH | EndorsingRightI;
export type EndorsingRights = EndorsingRightsH | EndorsingRightsI;

export type BakingRightH = BakingRightsH[number];
export type BakingRightI = BakingRightsI[number];
export type { BakingRightsH, BakingRightsI };
export type BakingRights = BakingRightsH | BakingRightI;
export type BakingRight = BakingRightH | BakingRightI;
export type Constants = ConstantsH | ConstantsI;

export type { OperationH, OperationI };
export type OperationEntry = OperationH | OperationI;

export type DoubleBakingEvidence =
  | DoubleBakingEvidenceH
  | DoubleBakingEvidenceI;

export type DoubleEndorsementEvidence =
  | DoubleEndorsementEvidenceH
  | DoubleEndorsementEvidenceI;

export type EndorsementWithSlot = EndorsementWithSlotH | EndorsementWithSlotI;
export { EndorsementWithSlotH, EndorsementWithSlotI };

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
