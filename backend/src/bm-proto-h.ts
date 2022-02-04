import { getLogger } from "loglevel";

import { BakerEvent, Deactivated, DeactivationRisk, Events } from "./events";

import { retry404 } from "./rpc/util";

import now from "./now";

import { RpcClient } from "./rpc/client";
import {
  BlockH,
  EndorsingRightsH,
  BakingRightsH,
  BakingRightH,
  OpKind,
  Delegate,
  OperationH as OperationEntry,
} from "./rpc/types";

const name = "bm-proto-h";

export type CheckBlockArgs = {
  bakers: string[];
  blockId: string;
  rpc: RpcClient;
  lastCycle: number | undefined;
};

export type CheckBlockResult = {
  events: BakerEvent[];
  blockLevel: number;
  blockCycle: number;
};

/**
 * Fetch block data and analyze it for any baking/endorsing related events.
 */
export default async ({
  bakers,
  blockId,
  rpc,
  lastCycle,
}: CheckBlockArgs): Promise<CheckBlockResult> => {
  const log = getLogger(name);
  log.trace(`Fetching baker data for block ${blockId}`);
  const events: BakerEvent[] = [];

  const { block, bakingRights, endorsingRights } = await loadBlockData(
    blockId,
    rpc
  );

  const metadata = block.metadata;

  if (!metadata) {
    throw new Error(`No metadata for block ${blockId}`);
  }

  log.trace(`Successfully retrieved baker data for block ${blockId}`, metadata);

  if (!metadata.level_info) {
    log.error("No level info in metadata", metadata);
    throw new Error(`Missing block metadata level`);
  }

  const blockLevel = metadata.level_info.level;
  const blockCycle = metadata.level_info.cycle;

  const { header } = block;
  // const priority =
  //   "priority" in header ? header.priority : header.payload_round;
  const priority = header.priority;
  const blockTimestamp = new Date(block.header.timestamp);

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
    return (
      bakingRight.priority === priority && bakingRight.level === blockLevel
    );
    // if ("priority" in bakingRight) {
    //   return (
    //     bakingRight.priority === priority && bakingRight.level === blockLevel
    //   );
    // }
    // return bakingRight.round === priority && bakingRight.level === blockLevel;
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
  return { events, blockLevel, blockCycle };
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
  bakingRights: BakingRightsH;
  endorsingRights: EndorsingRightsH;
  block: BlockH;
};

/**
 * Fetches block data needed to identify baking events for all bakers.
 */
export const loadBlockData = async (
  blockId: string,
  rpc: RpcClient
): Promise<BlockData> => {
  const log = getLogger(name);
  log.debug(`Fetching block ${blockId}`);
  const blockPromise = retry404(() => rpc.getBlock(blockId));
  const block = (await blockPromise) as BlockH;

  if (block === undefined) throw new Error(`Block ${blockId} not found`);
  if (block.metadata === undefined)
    throw new Error(`Block ${blockId} has no metadata`);
  if (block.metadata.level_info === undefined)
    throw new Error(`Block ${blockId} metadata has no level`);

  log.debug(`Block ${blockId} is at level`, block.metadata.level_info);
  const cycle = block.metadata.level_info.cycle;
  const level = block.metadata.level_info.level;

  log.debug(
    `Getting baking rights (cycle=${cycle}, level=${level}, block=${blockId})`
  );
  const t0 = new Date().getTime();

  const { header } = block;
  // const priority =
  //   "priority" in header ? header.priority : header.payload_round;

  const priority = header.priority;

  const bakingRightsPromise = retry404(() =>
    rpc.getBakingRights(blockId, level, priority)
  );
  log.debug(`Getting endorsement rights: cycle=${cycle}, block=${blockId}`);
  const endorsingRightsPromise = retry404(() =>
    rpc.getEndorsingRights(blockId, level - 1)
  );
  const [bakingRights, endorsingRights] = await Promise.all([
    bakingRightsPromise,
    endorsingRightsPromise,
  ]);

  const dt = new Date().getTime() - t0;
  log.debug(
    `Got rights in ${dt} ms (cycle=${cycle}, level=${level}, block=${blockId})`,
    bakingRights,
    endorsingRights
  );

  return {
    bakingRights: bakingRights as BakingRightsH,
    endorsingRights: endorsingRights as EndorsingRightsH,
    block,
  };
};

type CheckBlockBakingRightsArgs = {
  baker: string;
  blockBaker: string;
  blockId: string;
  bakingRight: BakingRightH;
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
  endorsingRights: EndorsingRightsH;
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
  const endorsingRight = endorsingRights.find(
    (right) => right.level === level && right.delegate === baker
  );
  if (endorsingRight) {
    const slotCount = endorsingRight.slots.length;
    log.debug(
      `found ${slotCount} endorsement slots for baker ${baker} at level ${level}`
    );
    const didEndorse =
      endorsementOperations.find((op) => isEndorsementByDelegate(op, baker)) !==
      undefined;
    if (didEndorse) {
      log.debug(`Successful endorse for baker ${baker}`);
      return [Events.Endorsed, endorsingRight.slots.length];
    } else {
      log.debug(`Missed endorse for baker ${baker} at level ${level}`);
      return [Events.MissedEndorsement, endorsingRight.slots.length];
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
      contentsItem.kind === OpKind.ENDORSEMENT_WITH_SLOT &&
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
        const accusedSignature = contentsItem.op1.signature;
        try {
          const block = (await retry404(() =>
            rpc.getBlock(`${accusedLevel}`)
          )) as BlockH;
          const endorsementOperations = block.operations[0];
          const operation = endorsementOperations.find((operation) => {
            for (const c of operation.contents) {
              if (c.kind === OpKind.ENDORSEMENT_WITH_SLOT) {
                if (c.endorsement.signature === accusedSignature) {
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
    if (
      contentsItem.kind === OpKind.ENDORSEMENT_WITH_SLOT &&
      "metadata" in contentsItem
    )
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
        const accusedPriority = contentsItem.bh1.priority;
        try {
          const bakingRights = await retry404(() =>
            rpc.getBakingRights(
              `${accusedLevel}`,
              accusedLevel,
              undefined,
              baker
            )
          );
          const hadBakingRights =
            (bakingRights as BakingRightsH).find(
              (right) =>
                right.priority === accusedPriority && right.delegate === baker
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
  const delegatesResponse = await retry404(() => rpc.getDelegate(baker));
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
