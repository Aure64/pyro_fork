export { NetworkConnection } from "./gen/NetworkConnection";
export { TezosVersion } from "./gen/TezosVersion";
export { BootstrappedStatus } from "./gen/BootstrappedStatus";

export { Participation } from "./gen/Psithaca2MLR/Participation";

import { Delegate as DelegateH } from "./gen/Delegate";
import { Delegate as DelegateI } from "./gen/Delegate";
import { Delegate as DelegateJ } from "./gen/Delegate";
import { Delegate as DelegateK } from "./gen/PtKathmankSp/Delegate";
import { Delegate as DelegateL } from "./gen/PtLimaPtLMwf/Delegate";
import { Delegate as DelegateM } from "./gen/PtMumbaiiFFE/Delegate";

import { ShellHeader as BlockHeaderH } from "./gen/PtHangz2aRng/BlockHeader";
import { ShellHeader as BlockHeaderI } from "./gen/Psithaca2MLR/BlockHeader";
import { ShellHeader as BlockHeaderJ } from "./gen/PtJakart2xVj/BlockHeader";
import { ShellHeader as BlockHeaderK } from "./gen/PtKathmankSp/BlockHeader";
import { ShellHeader as BlockHeaderL } from "./gen/PtLimaPtLMwf/BlockHeader";
import { ShellHeader as BlockHeaderM } from "./gen/PtMumbaiiFFE/BlockHeader";

import { EndorsingRights as EndorsingRightsH } from "./gen/PtHangz2aRng/EndorsingRights";
import { EndorsingRights as EndorsingRightsI } from "./gen/Psithaca2MLR/EndorsingRights";
import { EndorsingRights as EndorsingRightsJ } from "./gen/PtJakart2xVj/EndorsingRights";
import { EndorsingRights as EndorsingRightsK } from "./gen/PtKathmankSp/EndorsingRights";
import { EndorsingRights as EndorsingRightsL } from "./gen/PtLimaPtLMwf/EndorsingRights";
import { EndorsingRights as EndorsingRightsM } from "./gen/PtMumbaiiFFE/EndorsingRights";
import { Constants as ConstantsH } from "./gen/PtHangz2aRng/Constants";
import { Constants as ConstantsI } from "./gen/Psithaca2MLR/Constants";
import { Constants as ConstantsJ } from "./gen/PtJakart2xVj/Constants";
import { Constants as ConstantsK } from "./gen/PtKathmankSp/Constants";
import { Constants as ConstantsL } from "./gen/PtLimaPtLMwf/Constants";
import { Constants as ConstantsM } from "./gen/PtMumbaiiFFE/Constants";
import { BakingRights as BakingRightsH } from "./gen/PtHangz2aRng/BakingRights";
import { BakingRights as BakingRightsI } from "./gen/Psithaca2MLR/BakingRights";
import { BakingRights as BakingRightsJ } from "./gen/PtJakart2xVj/BakingRights";
import { BakingRights as BakingRightsK } from "./gen/PtKathmankSp/BakingRights";
import { BakingRights as BakingRightsL } from "./gen/PtLimaPtLMwf/BakingRights";
import { BakingRights as BakingRightsM } from "./gen/PtMumbaiiFFE/BakingRights";
import { Block as BlockH } from "./gen/PtHangz2aRng/Block";
import { Block as BlockI } from "./gen/Psithaca2MLR/Block";
import { Block as BlockJ } from "./gen/PtJakart2xVj/Block";
import { Block as BlockK } from "./gen/PtKathmankSp/Block";
import { Block as BlockL } from "./gen/PtLimaPtLMwf/Block";
import { Block as BlockM } from "./gen/PtMumbaiiFFE/Block";

import { Operation as OperationH } from "./gen/PtHangz2aRng/Block";
import { Operation as OperationI } from "./gen/Psithaca2MLR/Block";
import { Operation as OperationJ } from "./gen/PtJakart2xVj/Block";
import { Operation as OperationK } from "./gen/PtKathmankSp/Block";
import { Operation as OperationL } from "./gen/PtLimaPtLMwf/Block";
import { Operation as OperationM } from "./gen/PtMumbaiiFFE/Block";

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

import {
  DoubleBakingEvidence1 as DoubleBakingEvidenceJ,
  DoubleEndorsementEvidence1 as DoubleEndorsementEvidenceJ,
  Endorsement1 as EndorsementWithSlotJ,
} from "./gen/PtJakart2xVj/Block";

import {
  DoubleBakingEvidence1 as DoubleBakingEvidenceK,
  DoubleEndorsementEvidence1 as DoubleEndorsementEvidenceK,
  Endorsement1 as EndorsementWithSlotK,
} from "./gen/PtKathmankSp/Block";

import {
  DoubleBakingEvidence1 as DoubleBakingEvidenceL,
  DoubleEndorsementEvidence1 as DoubleEndorsementEvidenceL,
  Endorsement1 as EndorsementWithSlotL,
} from "./gen/PtLimaPtLMwf/Block";

import {
  DoubleBakingEvidence1 as DoubleBakingEvidenceM,
  DoubleEndorsementEvidence1 as DoubleEndorsementEvidenceM,
  Endorsement1 as EndorsementWithSlotM,
} from "./gen/PtMumbaiiFFE/Block";

export { DelegateH, DelegateI, DelegateJ, DelegateK, DelegateL, DelegateM };
export type Delegate =
  | DelegateH
  | DelegateI
  | DelegateJ
  | DelegateK
  | DelegateL
  | DelegateM;

export { BlockH, BlockI, BlockJ, BlockK, BlockL, BlockM };
export type Block = BlockH | BlockI | BlockJ | BlockK | BlockL | BlockM;

export {
  BlockHeaderH,
  BlockHeaderI,
  BlockHeaderJ,
  BlockHeaderK,
  BlockHeaderL,
  BlockHeaderM,
};
export type BlockHeader =
  | BlockHeaderH
  | BlockHeaderI
  | BlockHeaderJ
  | BlockHeaderK
  | BlockHeaderL
  | BlockHeaderM;

export type EndorsingRightH = EndorsingRightsH[number];
export type EndorsingRightI = EndorsingRightsI[number];
export type EndorsingRightJ = EndorsingRightsJ[number];
export type EndorsingRightK = EndorsingRightsK[number];
export type EndorsingRightL = EndorsingRightsL[number];
export type EndorsingRightM = EndorsingRightsM[number];
export type {
  EndorsingRightsH,
  EndorsingRightsI,
  EndorsingRightsJ,
  EndorsingRightsK,
  EndorsingRightsL,
  EndorsingRightsM,
};
export type EndorsingRight =
  | EndorsingRightH
  | EndorsingRightI
  | EndorsingRightJ
  | EndorsingRightK
  | EndorsingRightL
  | EndorsingRightM;
export type EndorsingRights =
  | EndorsingRightsH
  | EndorsingRightsI
  | EndorsingRightsJ
  | EndorsingRightsK
  | EndorsingRightsL
  | EndorsingRightsM;

export type BakingRightH = BakingRightsH[number];
export type BakingRightI = BakingRightsI[number];
export type BakingRightJ = BakingRightsI[number];
export type BakingRightK = BakingRightsK[number];
export type BakingRightL = BakingRightsL[number];
export type BakingRightM = BakingRightsM[number];
export type {
  BakingRightsH,
  BakingRightsI,
  BakingRightsJ,
  BakingRightsK,
  BakingRightsL,
  BakingRightsM,
};
export type BakingRights =
  | BakingRightsH
  | BakingRightsI
  | BakingRightsJ
  | BakingRightsK
  | BakingRightsL
  | BakingRightsM;
export type BakingRight =
  | BakingRightH
  | BakingRightI
  | BakingRightJ
  | BakingRightK
  | BakingRightL
  | BakingRightM;
export type Constants =
  | ConstantsH
  | ConstantsI
  | ConstantsJ
  | ConstantsK
  | ConstantsL
  | ConstantsM;

export type {
  OperationH,
  OperationI,
  OperationJ,
  OperationK,
  OperationL,
  OperationM,
};
export type OperationEntry =
  | OperationH
  | OperationI
  | OperationJ
  | OperationK
  | OperationL
  | OperationM;

export type DoubleBakingEvidence =
  | DoubleBakingEvidenceH
  | DoubleBakingEvidenceI
  | DoubleBakingEvidenceJ
  | DoubleBakingEvidenceK
  | DoubleBakingEvidenceL
  | DoubleBakingEvidenceM;

export type { DoubleBakingEvidenceH };
export type { DoubleBakingEvidenceI };
export type { DoubleBakingEvidenceJ };
export type { DoubleBakingEvidenceK };
export type { DoubleBakingEvidenceL };
export type { DoubleBakingEvidenceM };

export type DoubleEndorsementEvidence =
  | DoubleEndorsementEvidenceH
  | DoubleEndorsementEvidenceI
  | DoubleEndorsementEvidenceJ
  | DoubleEndorsementEvidenceK
  | DoubleEndorsementEvidenceL
  | DoubleEndorsementEvidenceM;

export {
  DoubleEndorsementEvidenceH,
  DoubleEndorsementEvidenceI,
  DoubleEndorsementEvidenceJ,
  DoubleEndorsementEvidenceK,
  DoubleEndorsementEvidenceL,
  DoubleEndorsementEvidenceM,
};

export type EndorsementWithSlot =
  | EndorsementWithSlotH
  | EndorsementWithSlotI
  | EndorsementWithSlotJ
  | EndorsementWithSlotK
  | EndorsementWithSlotL
  | EndorsementWithSlotM;
export {
  EndorsementWithSlotH,
  EndorsementWithSlotI,
  EndorsementWithSlotJ,
  EndorsementWithSlotK,
  EndorsementWithSlotL,
  EndorsementWithSlotM,
};

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
  DOUBLE_PREENDORSEMENT_EVIDENCE = "double_preendorsement_evidence",
  DOUBLE_BAKING_EVIDENCE = "double_baking_evidence",
  PROPOSALS = "proposals",
  BALLOT = "ballot",
  FAILING_NOOP = "failing_noop",
}

export type TzAddress = string;
export type URL = string;

export type ConsensusKey = {
  active: string;
  pendings?: { cycle: number; pkh: string }[];
};
