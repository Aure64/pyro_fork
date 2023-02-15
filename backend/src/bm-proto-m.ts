import { getLogger } from "loglevel";

import { BakerEvent, Events } from "./events";

import now from "./now";

import { RpcClient } from "./rpc/client";
import {
  BlockM,
  EndorsingRightsM,
  BakingRightsM,
  OpKind,
  OperationM,
} from "./rpc/types";

const name = "bm-proto-m";

export type CheckBlockArgs = {
  bakers: string[];
  block: BlockM;
  rpc: RpcClient;
};

const EMPTY_LIST = Object.freeze([]);

/**
 * Analyze block data for baking and endorsing related events.
 */
export default async ({
  bakers,
  block,
  rpc,
}: CheckBlockArgs): Promise<BakerEvent[]> => {
  const metadata = block.metadata!;
  const blockLevel = metadata.level_info.level;
  const blockCycle = metadata.level_info.cycle;
  const blockId = `${blockLevel}`;

  const { header } = block;
  const priority = header.payload_round;
  const blockTimestamp = new Date(header.timestamp);

  const [bakingRights, endorsingRights] = <[BakingRightsM, EndorsingRightsM]>(
    await rpc.getRights(blockLevel, priority)
  );

  const events: BakerEvent[] = [];

  const createEvent = (
    baker: string,
    kind:
      | Events.Baked
      | Events.MissedBake
      | Events.MissedBonus
      | Events.Endorsed
      | Events.MissedEndorsement
      | Events.DoubleBaked
      | Events.DoubleEndorsed
      | Events.DoublePreendorsed,
    level = blockLevel,
    slotCount?: number
  ): BakerEvent => {
    const event: any = {
      baker,
      kind,
      createdAt: now(),
      level,
      cycle: blockCycle,
      timestamp: blockTimestamp,
    };
    if (kind === Events.Baked) event.priority = priority;
    if (kind === Events.Endorsed || kind === Events.MissedEndorsement)
      event.slotCount = slotCount;
    return event;
  };

  for (const baker of bakers) {
    const endorsementOperations = block.operations[0];
    const anonymousOperations = block.operations[2];
    const bakingEvent = checkBlockBakingRights({
      baker,
      bakingRights: bakingRights,
      blockBaker: metadata.baker,
      blockProposer: metadata.proposer,
      blockId,
      blockPriority: priority,
    });
    if (bakingEvent) {
      events.push(createEvent(baker, bakingEvent));
    }

    const endorsingEvent = checkBlockEndorsingRights({
      baker,
      level: blockLevel - 1,
      endorsementOperations,
      endorsingRights,
    });
    if (endorsingEvent) {
      const [kind, slotCount] = endorsingEvent;
      events.push(createEvent(baker, kind, blockLevel - 1, slotCount));
    }
    const doubleBakeEvent = await checkBlockAccusationsForDoubleBake(
      baker,
      anonymousOperations
    );
    if (doubleBakeEvent) {
      events.push(createEvent(baker, Events.DoubleBaked));
    }
    const doubleEndorseEvent = await checkBlockAccusationsForDoubleEndorsement(
      baker,
      anonymousOperations
    );
    if (doubleEndorseEvent) {
      events.push(createEvent(baker, doubleEndorseEvent));
    }
  }
  return events;
};

/**
 * Check the baking rights for a block to see if the provided baker had a successful or missed bake.
 */

export const checkBlockBakingRights = ({
  baker,
  blockBaker,
  blockProposer,
  bakingRights,
  blockId,
  blockPriority,
}: {
  baker: string;
  blockBaker: string;
  blockProposer: string;
  blockId: string;
  bakingRights: BakingRightsM;
  blockPriority: number;
}): Events.MissedBake | Events.MissedBonus | Events.Baked | null => {
  const log = getLogger(name);

  //baher's scheduled right
  const bakerRight = bakingRights.find((bakingRight) => {
    return bakingRight.delegate == baker;
  });

  if (!bakerRight) {
    //baker had no baking rights at this level
    log.debug(`No baking slot at block ${blockId} for ${baker}`);
    return null;
  }

  //actual baking right at block's round
  const blockRight = bakingRights.find((bakingRight) => {
    return bakingRight.round == blockPriority;
  });

  if (!blockRight) {
    log.error(
      `No rights found block ${blockId} at round ${blockPriority}`,
      bakingRights
    );
    return null;
  }

  if (blockProposer === baker && blockBaker !== baker) {
    log.info(
      `${baker} proposed block at level ${blockRight.level}, but didn't bake it`
    );
    return Events.MissedBonus;
  }

  if (bakerRight.round < blockRight.round) {
    log.info(
      `${baker} had baking slot for round ${bakerRight.round}, but missed it (block baked at round ${blockPriority})`
    );
    return Events.MissedBake;
  }

  if (
    blockRight.delegate === baker &&
    blockRight.round === bakerRight.round &&
    blockBaker === baker
  ) {
    log.info(
      `${baker} baked block ${blockId} at round ${blockPriority} of level ${blockRight.level}`
    );
    return Events.Baked;
  }

  return null;
};

type CheckBlockEndorsingRightsArgs = {
  baker: string;
  endorsementOperations: OperationM[];
  level: number;
  endorsingRights: EndorsingRightsM;
};

/**
 * Check the endorsing rights for a block to see if the provided endorser had a successful or missed endorse.
 */
export const checkBlockEndorsingRights = ({
  baker,
  endorsementOperations,
  level,
  endorsingRights,
}: CheckBlockEndorsingRightsArgs):
  | [Events.Endorsed | Events.MissedEndorsement, number]
  | null => {
  const log = getLogger(name);
  const levelRights = endorsingRights.find((right) => right.level === level);
  if (!levelRights) {
    log.warn(`did not find rights for level ${level} in`, endorsingRights);
    return null;
  }
  const endorsingRight = levelRights.delegates.find(
    (d) => d.delegate === baker
  );
  if (endorsingRight) {
    const slotCount = endorsingRight.endorsing_power;
    log.debug(
      `found ${slotCount} endorsement slots for baker ${baker} at level ${level}`
    );
    const didEndorse =
      endorsementOperations.find((op) => isEndorsementByDelegate(op, baker)) !==
      undefined;
    if (didEndorse) {
      log.debug(`Successful endorse for baker ${baker}`);
      return [Events.Endorsed, slotCount];
    } else {
      log.debug(`Missed endorse for baker ${baker} at level ${level}`);
      return [Events.MissedEndorsement, slotCount];
    }
  }

  log.debug(`No endorse event for baker ${baker}`);
  return null;
};

const isEndorsementByDelegate = (
  operation: OperationM,
  delegate: string
): boolean => {
  for (const contentsItem of operation.contents) {
    if (
      contentsItem.kind === OpKind.ENDORSEMENT &&
      "metadata" in contentsItem
    ) {
      if (contentsItem.metadata.delegate === delegate) {
        return true;
      }
    }
  }

  return false;
};

export const checkBlockAccusationsForDoubleEndorsement = async (
  baker: string,
  operations: OperationM[]
): Promise<Events.DoubleEndorsed | Events.DoublePreendorsed | null> => {
  const log = getLogger(name);
  for (const operation of operations) {
    for (const contentsItem of operation.contents) {
      if (
        contentsItem.kind === OpKind.DOUBLE_ENDORSEMENT_EVIDENCE ||
        contentsItem.kind === OpKind.DOUBLE_PREENDORSEMENT_EVIDENCE
      ) {
        const { kind } = contentsItem;
        const { level, round } = contentsItem.op1.operations;
        if ("metadata" in contentsItem) {
          for (const balanceUpdate of contentsItem.metadata.balance_updates ||
            EMPTY_LIST) {
            if (
              balanceUpdate.kind === "freezer" &&
              balanceUpdate.category === "deposits" &&
              balanceUpdate.delegate === baker
            ) {
              log.info(`${baker} ${kind} at level ${level} round ${round}`);
              return kind === OpKind.DOUBLE_ENDORSEMENT_EVIDENCE
                ? Events.DoubleEndorsed
                : Events.DoublePreendorsed;
            }
          }
          log.warn(
            `Found ${kind} for level ${level} with metadata, but no freezer balance update, unable to process`
          );
        } else {
          //perhaps the block is too old for node's history mode
          log.warn(
            `Found ${kind} without metadata for level ${level}, unable to process`
          );
        }
      }
    }
  }

  return null;
};

export const checkBlockAccusationsForDoubleBake = async (
  baker: string,
  operations: OperationM[]
): Promise<boolean> => {
  const log = getLogger(name);
  for (const operation of operations) {
    for (const contentsItem of operation.contents) {
      if (contentsItem.kind === OpKind.DOUBLE_BAKING_EVIDENCE) {
        const { level, payload_round } = contentsItem.bh1;
        if ("metadata" in contentsItem) {
          for (const balanceUpdate of contentsItem.metadata.balance_updates ||
            EMPTY_LIST) {
            if (
              balanceUpdate.kind === "freezer" &&
              balanceUpdate.category === "deposits" &&
              balanceUpdate.delegate === baker
            ) {
              log.info(
                `${baker} double baked level ${level}, round ${payload_round}`
              );
              return true;
            }
          }
          log.warn(
            `Found double baking evidence for level ${level} with metadata, but no freezer balance update, unable to precess`
          );
        } else {
          //perhaps the block is too old for node's history mode
          log.warn(
            `Found double baking evidence without metadata for level ${level}, unable to process`
          );
        }
      }
    }
  }

  return false;
};
