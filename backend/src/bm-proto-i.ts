import { getLogger } from "loglevel";

import { BakerEvent, Deactivated, DeactivationRisk, Events } from "./events";

import now from "./now";

import { RpcClient } from "./rpc/client";
import {
  BlockI,
  EndorsingRightsI,
  BakingRightsI,
  BakingRightI,
  OpKind,
  Delegate,
  OperationI as OperationEntry,
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

  const bakingRightForBlock = bakingRights.find((bakingRight) => {
    return bakingRight.round === priority && bakingRight.level === blockLevel;
  });
  log.debug(
    `Baking right for block ${blockLevel} of priority ${priority}:`,
    bakingRightForBlock
  );

  for (const baker of bakers) {
    const endorsementOperations = block.operations[0];
    const anonymousOperations = block.operations[2];
    if (bakingRightForBlock) {
      const bakingEvent = checkBlockBakingRights({
        baker,
        bakingRight: bakingRightForBlock,
        blockBaker: metadata.baker,
        blockId,
        blockPriority: priority,
      });
      if (bakingEvent) {
        events.push(createEvent(baker, bakingEvent));
      }
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
    const doubleBakeEvent = await checkBlockAccusationsForDoubleBake({
      baker,
      operations: anonymousOperations,
      rpc,
    });
    if (doubleBakeEvent) {
      events.push(createEvent(baker, Events.DoubleBaked));
    }
    const doubleEndorseEvent = await checkBlockAccusationsForDoubleEndorsement({
      baker,
      operations: anonymousOperations,
      rpc,
    });
    if (doubleEndorseEvent) {
      events.push(createEvent(baker, Events.DoubleEndorsed));
    }
  }
  return events;
};

// type LoadBlockDataArgs = {
//   blockId: string;
//   rpc: RpcClient;
// };

// type BlockData = {
//   bakingRights: BakingRightsResponse;
//   endorsingRights: EndorsingRightsResponse;
//   block: BlockResponse;
// };

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

type CheckBlockBakingRightsArgs = {
  baker: string;
  blockBaker: string;
  blockId: string;
  bakingRight: BakingRightI;
  blockPriority: number;
};

/**
 * Check the baking rights for a block to see if the provided baker had a successful or missed bake.
 */

export const checkBlockBakingRights = ({
  baker,
  blockBaker,
  bakingRight,
  blockId,
  blockPriority,
}: CheckBlockBakingRightsArgs): Events.MissedBake | Events.Baked | null => {
  const log = getLogger(name);

  if (bakingRight.delegate === baker) {
    if (blockBaker === baker) {
      log.debug(
        `Successful bake for block ${blockId} for baker ${baker} at priority ${blockPriority}`
      );
      return Events.Baked;
    }
    log.info(`Missed bake detected for baker ${baker}`);
    return Events.MissedBake;
  }

  log.debug(`No bake event for block ${blockId} for baker ${baker}`);
  return null;
};

type CheckBlockEndorsingRightsArgs = {
  baker: string;
  endorsementOperations: OperationEntry[];
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
  operation: OperationEntry,
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

type CheckBlockAccusationsForDoubleEndorsementArgs = {
  baker: string;
  operations: OperationEntry[];
  rpc: RpcClient;
};

export const checkBlockAccusationsForDoubleEndorsement = async ({
  baker,
  operations,
  rpc,
}: CheckBlockAccusationsForDoubleEndorsementArgs): Promise<boolean> => {
  const log = getLogger(name);
  for (const operation of operations) {
    for (const contentsItem of operation.contents) {
      if (contentsItem.kind === OpKind.DOUBLE_ENDORSEMENT_EVIDENCE) {
        const accusedLevel = contentsItem.op1.operations.level;
        const accusedRound = contentsItem.op1.operations.round;
        const accusedSignature = contentsItem.op1.signature;
        try {
          const block = (await rpc.getBlock(`${accusedLevel}`)) as BlockI;
          const endorsementOperations = block.operations[0];
          const operation = endorsementOperations.find((operation) => {
            for (const c of operation.contents) {
              if (c.kind === OpKind.ENDORSEMENT) {
                if (
                  c.round === accusedRound &&
                  operation.signature === accusedSignature
                ) {
                  return true;
                }
              }
            }
          });
          const endorser = operation && findEndorserForOperation(operation);
          if (endorser) {
            if (endorser === baker) {
              log.info(
                `Double endorsement for baker ${baker} at block ${block.hash}`
              );
              return true;
            }
          } else {
            log.warn(
              `Unable to find endorser for double endorsed block ${block.hash}`
            );
          }
        } catch (err) {
          log.warn(
            `Error fetching block info to determine double endorsement violator because of `,
            err
          );
        }
      }
    }
  }

  return false;
};

/**
 * Searches through the contents of an operation to find the delegate who performed the endorsement.
 */
const findEndorserForOperation = (operation: OperationEntry) => {
  for (const contentsItem of operation.contents) {
    if (contentsItem.kind === OpKind.ENDORSEMENT && "metadata" in contentsItem)
      return contentsItem.metadata.delegate;
  }

  return null;
};

type CheckBlockAccusationsForDoubleBakeArgs = {
  baker: string;
  operations: OperationEntry[];
  rpc: RpcClient;
};

export const checkBlockAccusationsForDoubleBake = async ({
  baker,
  operations,
  rpc,
}: CheckBlockAccusationsForDoubleBakeArgs): Promise<boolean> => {
  const log = getLogger(name);
  for (const operation of operations) {
    for (const contentsItem of operation.contents) {
      if (contentsItem.kind === OpKind.DOUBLE_BAKING_EVIDENCE) {
        const accusedHash = operation.hash;
        const accusedLevel = contentsItem.bh1.level;
        const accusedPriority = contentsItem.bh1.payload_round;
        try {
          const bakingRights = (await rpc.getBakingRights(
            `${accusedLevel}`,
            accusedLevel,
            undefined,
            baker
          )) as BakingRightsI;
          const hadBakingRights =
            bakingRights.find(
              (right) =>
                right.round === accusedPriority && right.delegate === baker
            ) !== undefined;
          if (hadBakingRights) {
            log.info(
              `Double bake for baker ${baker} at level ${accusedLevel} with hash ${accusedHash}`
            );
            return true;
          }
        } catch (err) {
          log.warn(
            `Error fetching baking rights to determine double bake violator because of `,
            err
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
