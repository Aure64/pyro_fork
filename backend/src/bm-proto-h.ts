import { getLogger } from "loglevel";

import { BakerEvent, Events } from "./events";

import now from "./now";

import { RpcClient } from "./rpc/client";
import {
  BlockH,
  EndorsingRightsH,
  BakingRightsH,
  OpKind,
  OperationH as OperationEntry,
} from "./rpc/types";

const name = "bm-proto-h";

export type CheckBlockArgs = {
  bakers: string[];
  block: BlockH;
  rpc: RpcClient;
};

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
  const priority = header.priority;
  const blockTimestamp = new Date(header.timestamp);

  const [bakingRights, endorsingRights] = <[BakingRightsH, EndorsingRightsH]>(
    await rpc.getRights(blockLevel, priority)
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

  for (const baker of bakers) {
    const endorsementOperations = block.operations[0];
    const anonymousOperations = block.operations[2];
    const bakingEvent = checkBlockBakingRights({
      baker,
      bakingRights,
      blockBaker: metadata.baker,
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

type BlockData = {
  bakingRights: BakingRightsH;
  endorsingRights: EndorsingRightsH;
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
    bakingRights: bakingRights as BakingRightsH,
    endorsingRights: endorsingRights as EndorsingRightsH,
  };
};

/**
 * Check the baking rights for a block to see if the provided baker had a successful or missed bake.
 */

export const checkBlockBakingRights = ({
  baker,
  blockBaker,
  bakingRights,
  blockId,
  blockPriority,
}: {
  baker: string;
  blockBaker: string;
  blockId: string;
  bakingRights: BakingRightsH;
  blockPriority: number;
}): Events.MissedBake | Events.Baked | null => {
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

  //actual baking right at block's priority
  const blockRight = bakingRights.find((bakingRight) => {
    return bakingRight.priority == blockPriority;
  });

  if (!blockRight) {
    log.error(
      `No rights found block ${blockId} at priority ${blockPriority}`,
      bakingRights
    );
    return null;
  }

  if (bakerRight.priority < blockRight.priority) {
    log.info(
      `${baker} had baking slot for priority ${bakerRight.priority}, but missed it (block baked at priority ${blockPriority})`
    );
    return Events.MissedBake;
  }

  if (
    blockRight.delegate === baker &&
    blockRight.priority === bakerRight.priority &&
    blockBaker === baker
  ) {
    log.info(
      `${baker} baked block ${blockId} at priority ${blockPriority} of level ${blockRight.level}`
    );
    return Events.Baked;
  }

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
          const block = (await rpc.getBlock(`${accusedLevel}`)) as BlockH;
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
          const bakingRights = await rpc.getBakingRights(
            `${accusedLevel}`,
            accusedLevel,
            undefined,
            baker
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
