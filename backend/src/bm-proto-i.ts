import { getLogger } from "loglevel";

import { BakerEvent, Deactivated, DeactivationRisk, Events } from "./events";

import now from "./now";

import { RpcClient } from "./rpc/client";
import {
  BlockI,
  EndorsingRightsI,
  BakingRightsI,
  OpKind,
  Delegate,
  OperationI,
} from "./rpc/types";

const name = "bm-proto-i";

export type CheckBlockArgs = {
  bakers: string[];
  block: BlockI;
  rpc: RpcClient;
  lastCycle: number | undefined;
};

/**
 * Fetch block data and analyze it for any baking/endorsing related events.
 */
export default async ({
  bakers,
  block,
  rpc,
  lastCycle,
}: CheckBlockArgs): Promise<BakerEvent[]> => {
  const log = getLogger(name);

  const metadata = block.metadata!;
  const blockLevel = metadata.level_info.level;
  const blockCycle = metadata.level_info.cycle;
  const blockId = `${blockLevel}`;

  const { header } = block;
  const priority = header.payload_round;
  const blockTimestamp = new Date(header.timestamp);

  const { bakingRights, endorsingRights } = await loadBlockRights(
    blockId,
    blockLevel,
    priority,
    rpc
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
      | Events.DoubleEndorsed,
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
    if (!lastCycle || blockCycle > lastCycle) {
      const deactivationEvent = await getDeactivationEvent({
        baker,
        rpc,
        cycle: blockCycle,
      });
      if (deactivationEvent) events.push(deactivationEvent);
    } else {
      log.debug(
        `Not checking deactivations as this cycle (${blockCycle}) was already checked`
      );
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
      events.push(createEvent(baker, Events.DoubleEndorsed));
    }
  }
  return events;
};

type BlockData = {
  bakingRights: BakingRightsI;
  endorsingRights: EndorsingRightsI;
};

export const loadBlockRights = async (
  blockId: string,
  level: number,
  priority: number,
  rpc: RpcClient
): Promise<BlockData> => {
  const bakingRightsPromise = rpc.getBakingRights(blockId, level, priority);
  const endorsingRightsPromise = rpc.getEndorsingRights(blockId, level - 1);
  const [bakingRights, endorsingRights] = await Promise.all([
    bakingRightsPromise,
    endorsingRightsPromise,
  ]);

  return {
    bakingRights: bakingRights as BakingRightsI,
    endorsingRights: endorsingRights as EndorsingRightsI,
  };
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
  bakingRights: BakingRightsI;
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
  endorsementOperations: OperationI[];
  level: number;
  endorsingRights: EndorsingRightsI;
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
  operation: OperationI,
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
  operations: OperationI[]
): Promise<boolean> => {
  const log = getLogger(name);
  for (const operation of operations) {
    for (const contentsItem of operation.contents) {
      if (contentsItem.kind === OpKind.DOUBLE_ENDORSEMENT_EVIDENCE) {
        const { level, round } = contentsItem.op1.operations;
        if ("metadata" in contentsItem) {
          for (const balanceUpdate of contentsItem.metadata.balance_updates) {
            if (
              balanceUpdate.kind === "freezer" &&
              balanceUpdate.category === "deposits" &&
              balanceUpdate.delegate === baker
            ) {
              log.info(
                `${baker} double endorsed block at level ${level} round ${round}`
              );
              return true;
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

  return false;
};

export const checkBlockAccusationsForDoubleBake = async (
  baker: string,
  operations: OperationI[]
): Promise<boolean> => {
  const log = getLogger(name);
  for (const operation of operations) {
    for (const contentsItem of operation.contents) {
      if (contentsItem.kind === OpKind.DOUBLE_BAKING_EVIDENCE) {
        const { level, payload_round } = contentsItem.bh1;
        if ("metadata" in contentsItem) {
          for (const balanceUpdate of contentsItem.metadata.balance_updates) {
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

type GetDeactivationEventsArgs = {
  baker: string;
  cycle: number;
  rpc: RpcClient;
};

const getDeactivationEvent = async ({
  baker,
  cycle,
  rpc,
}: GetDeactivationEventsArgs): Promise<
  Deactivated | DeactivationRisk | null
> => {
  const delegatesResponse = await rpc.getDelegate(baker);
  return checkForDeactivations({ baker, cycle, delegatesResponse });
};

type CheckForDeactivationsArgs = {
  baker: string;
  cycle: number;
  delegatesResponse: Delegate;
};

export const checkForDeactivations = async ({
  baker,
  cycle,
  delegatesResponse,
}: CheckForDeactivationsArgs): Promise<
  Deactivated | DeactivationRisk | null
> => {
  const log = getLogger(name);
  const createdAt = now();
  if (delegatesResponse.deactivated) {
    log.debug(`Baker ${baker} is deactivated (on or before cycle ${cycle})`);
    return {
      kind: Events.Deactivated,
      baker,
      cycle,
      createdAt,
    };
  } else if (delegatesResponse.grace_period - cycle <= 1) {
    log.debug(
      `Baker ${baker} is scheduled for deactivation in cycle ${delegatesResponse.grace_period}`
    );
    return {
      kind: Events.DeactivationRisk,
      baker,
      cycle: delegatesResponse.grace_period,
      createdAt,
    };
  } else {
    const message = `Baker ${baker} is not at risk of deactivation`;
    log.debug(message);
  }

  return null;
};
