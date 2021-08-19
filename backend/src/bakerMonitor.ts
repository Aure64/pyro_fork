//import { BakerEvent, TezosNodeEvent } from "./types";
import {
  BakerEvent,
  DoubleBaked,
  DoubleEndorsed,
  Deactivated,
  DeactivationRisk,
  Event,
  Events,
} from "./events";
import { getLogger } from "loglevel";
import {
  BakingRightsResponse,
  BlockMetadata,
  BlockResponse,
  ConstantsResponse,
  EndorsingRightsResponse,
  OperationEntry,
  OpKind,
  RpcClient,
  DelegatesResponse,
} from "@taquito/rpc";
import { retry404, tryForever } from "./networkWrapper";

import { delay } from "./delay";

import * as service from "./service";
import * as storage from "./storage";

import now from "./now";
import * as format from "./format";

const name = "bm";

type URL = string;

export type BakerMonitorConfig = {
  bakers: string[];
  rpc: URL;
  max_catchup_blocks: number;
};

type ChainPositionInfo = { blockLevel: number; blockCycle: number };

export const create = async (
  storageDirectory: string,
  { bakers, rpc: rpcUrl, max_catchup_blocks: catchupLimit }: BakerMonitorConfig,
  onEvent: (event: Event) => Promise<void>
): Promise<service.Service> => {
  const log = getLogger(name);
  const rpc = new RpcClient(rpcUrl);

  const chainId = await tryForever(
    () => rpc.getChainId(),
    60e3,
    "get chain id"
  );

  log.info(`Chain: ${chainId}`);
  const constants = await tryForever(
    () => rpc.getConstants(),
    60e3,
    "get protocol constants"
  );

  log.info("Protocol constants", constants);

  const CHAIN_POSITION_KEY = "position";

  const store = await storage.open([
    storageDirectory,
    "baker-monitor",
    chainId,
  ]);

  const getPosition = async () =>
    (await store.get(CHAIN_POSITION_KEY, {
      blockLevel: -1,
      blockCycle: -1,
    })) as ChainPositionInfo;

  const setPosition = async (value: ChainPositionInfo) =>
    await store.put(CHAIN_POSITION_KEY, value);

  const task = async (isInterrupted: () => boolean) => {
    try {
      const chainPosition = await getPosition();
      const lastBlockLevel = chainPosition.blockLevel;
      let lastBlockCycle = chainPosition.blockCycle;
      log.debug("Getting head block header");
      const headHeader = await rpc.getBlockHeader();
      const { level, hash } = headHeader;
      log.debug(
        `Got block ${hash} at level ${level} [currently at ${lastBlockLevel}]`
      );

      const minLevel = catchupLimit ? level - catchupLimit : level;
      const startLevel = lastBlockLevel
        ? Math.max(lastBlockLevel + 1, minLevel)
        : level;

      log.debug(`Processing blocks starting at level ${startLevel}`);

      let currentLevel = startLevel;

      while (currentLevel <= level && !isInterrupted()) {
        log.debug(
          `Processing block at level ${currentLevel} for ${bakers.length} baker(s)`
        );
        const { events, blockLevel, blockCycle } = await checkBlock({
          bakers,
          rpc,
          blockId: currentLevel.toString(),
          lastCycle: lastBlockCycle,
          constants,
        });
        if (blockLevel !== currentLevel) {
          throw new Error(
            `Block level ${currentLevel} was requested but data returned level ${blockLevel}`
          );
        }
        log.debug(
          `About to post ${events.length} baking events`,
          format.aggregateByBaker(events)
        );
        for (const event of events) {
          await onEvent(event);
        }
        await setPosition({ blockLevel: currentLevel, blockCycle });
        currentLevel++;
        lastBlockCycle = blockCycle;
        await delay(1000);
      }
    } catch (err) {
      log.warn("RPC Error", err);
    }
  };

  const interval = 1000 * constants.time_between_blocks[0].toNumber();

  const srv = service.create(name, task, interval);

  return {
    name: srv.name,
    start: srv.start,
    stop: srv.stop,
  };
};

type CheckBlockArgs = {
  bakers: string[];
  blockId: string;
  rpc: RpcClient;
  lastCycle: number | undefined;
  constants: ConstantsResponse;
};

type CheckBlockResult = {
  events: BakerEvent[];
  blockLevel: number;
  blockCycle: number;
};

/**
 * Fetch block data and analyze it for any baking/endorsing related events.
 */
const checkBlock = async ({
  bakers,
  blockId,
  rpc,
  lastCycle,
  constants,
}: CheckBlockArgs): Promise<CheckBlockResult> => {
  const log = getLogger(name);
  log.trace(`Fetching baker data for block ${blockId}`);
  const events: BakerEvent[] = [];

  const { metadata, block, bakingRights, endorsingRights } =
    await loadBlockData({
      blockId,
      rpc,
    });

  log.trace(`Successfully retrieved baker data for block ${blockId}`, metadata);

  if (!metadata.level_info) {
    log.error("No level info in metadata", metadata);
    throw new Error(`Missing block metadata level`);
  }

  const blockLevel = metadata.level_info.level;
  const blockCycle = metadata.level_info.cycle;

  for (const baker of bakers) {
    const endorsementOperations = block.operations[0];
    const anonymousOperations = block.operations[2];
    const bakingEvent = checkBlockBakingRights({
      baker,
      bakingRights,
      blockBaker: metadata.baker,
      blockId,
      level: blockLevel,
    });
    if (bakingEvent) events.push(bakingEvent);
    const endorsingEvent = checkBlockEndorsingRights({
      baker,
      level: blockLevel - 1,
      endorsementOperations,
      endorsingRights,
    });
    if (endorsingEvent) events.push(endorsingEvent);
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
      level: blockLevel,
    });
    if (doubleBakeEvent) {
      events.push(doubleBakeEvent);
    }
    const doubleEndorseEvent = await checkBlockAccusationsForDoubleEndorsement({
      baker,
      operations: anonymousOperations,
      rpc,
      level: blockLevel,
    });
    if (doubleEndorseEvent) {
      events.push(doubleEndorseEvent);
    }
  }
  return { events, blockLevel, blockCycle };
};

type LoadBlockDataArgs = {
  blockId: string;
  rpc: RpcClient;
};

type BlockData = {
  metadata: BlockMetadata;
  bakingRights: BakingRightsResponse;
  endorsingRights: EndorsingRightsResponse;
  block: BlockResponse;
};

/**
 * Fetches block data needed to identify baking events for all bakers.
 */
export const loadBlockData = async ({
  blockId,
  rpc,
}: LoadBlockDataArgs): Promise<BlockData> => {
  const log = getLogger(name);
  log.debug(`Fetching block ${blockId}`);
  const blockPromise = retry404(() => rpc.getBlock({ block: blockId }));
  const block = await blockPromise;

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
  const bakingRightsPromise = retry404(() =>
    rpc.getBakingRights(
      {
        max_priority: 0,
        level,
      },
      { block: blockId }
    )
  );
  log.debug(`Getting endorsement rights: cycle=${cycle}, block=${blockId}`);
  const endorsingRightsPromise = retry404(() =>
    rpc.getEndorsingRights(
      {
        level: level - 1,
      },
      { block: blockId }
    )
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

  return { metadata: block.metadata, bakingRights, endorsingRights, block };
};

type CheckBlockBakingRightsArgs = {
  baker: string;
  blockBaker: string;
  blockId: string;
  level: number;
  bakingRights: BakingRightsResponse;
};

// For now just check for missed bakes where baker was the top priority
const priority = 0;
/**
 * Check the baking rights for a block to see if the provided baker had a successful or missed bake.
 */

export const checkBlockBakingRights = ({
  baker,
  blockBaker,
  level,
  bakingRights,
  blockId,
}: CheckBlockBakingRightsArgs): BakerEvent | null => {
  const log = getLogger(name);
  const createdAt = now();
  for (const bakingRight of bakingRights) {
    if (
      bakingRight.delegate === baker &&
      bakingRight.level === level &&
      bakingRight.priority === priority
    ) {
      log.debug(
        `found baking slot for priority ${priority} for baker ${baker}`
      );
      // if baker was priority 0 but didn't bake, that opportunity was lost to another baker
      if (blockBaker !== baker) {
        log.info(`Missed bake detected for baker ${baker}`);
        return {
          kind: Events.MissedBake,
          baker,
          level,
          createdAt,
        };
      } else {
        log.debug(`Successful bake for block ${blockId} for baker ${baker}`);
        return {
          kind: Events.Baked,
          baker,
          level,
          createdAt,
        };
      }
    }
  }

  log.debug(`No bake event for block ${blockId} for baker ${baker}`);
  return null;
};

type CheckBlockEndorsingRightsArgs = {
  baker: string;
  endorsementOperations: OperationEntry[];
  level: number;
  endorsingRights: EndorsingRightsResponse;
};

/**
 * Check the endorsing rights for a block to see if the provided endorser had a successful or missed endorse.
 */
export const checkBlockEndorsingRights = ({
  baker,
  endorsementOperations,
  level,
  endorsingRights,
}: CheckBlockEndorsingRightsArgs): BakerEvent | null => {
  const log = getLogger(name);
  const endorsingRight = endorsingRights.find(
    (right) => right.level === level && right.delegate === baker
  );
  const shouldEndorse = endorsingRight !== undefined;
  const createdAt = now();
  if (shouldEndorse) {
    log.debug(`found endorsing slot for baker ${baker} at level ${level}`);
    const didEndorse =
      endorsementOperations.find((op) => isEndorsementByDelegate(op, baker)) !==
      undefined;
    if (didEndorse) {
      log.debug(`Successful endorse for baker ${baker}`);
      return {
        kind: Events.Endorsed,
        baker,
        level,
        createdAt,
      };
    } else {
      log.debug(`Missed endorse for baker ${baker} at level ${level}`);
      return {
        kind: Events.MissedEndorsement,
        baker,
        level,
        createdAt,
      };
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
  level: number;
};

export const checkBlockAccusationsForDoubleEndorsement = async ({
  baker,
  operations,
  rpc,
  level,
}: CheckBlockAccusationsForDoubleEndorsementArgs): Promise<DoubleEndorsed | null> => {
  const log = getLogger(name);
  for (const operation of operations) {
    for (const contentsItem of operation.contents) {
      if (contentsItem.kind === OpKind.DOUBLE_ENDORSEMENT_EVIDENCE) {
        const accusedLevel = contentsItem.op1.operations.level;
        const accusedSignature = contentsItem.op1.signature;
        try {
          const block = await retry404(() =>
            rpc.getBlock({ block: `${accusedLevel}` })
          );
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
              return {
                kind: Events.DoubleEndorsed,
                baker,
                level,
                createdAt: now(),
              };
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

  return null;
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
  level: number;
};

export const checkBlockAccusationsForDoubleBake = async ({
  baker,
  operations,
  rpc,
  level,
}: CheckBlockAccusationsForDoubleBakeArgs): Promise<DoubleBaked | null> => {
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
              { delegate: baker, level: accusedLevel },
              { block: `${accusedLevel}` }
            )
          );
          const hadBakingRights =
            bakingRights.find(
              (right) =>
                right.priority === accusedPriority && right.delegate === baker
            ) !== undefined;
          if (hadBakingRights) {
            log.info(
              `Double bake for baker ${baker} at level ${accusedLevel} with hash ${accusedHash}`
            );
            return {
              kind: Events.DoubleBaked,
              baker,
              level,
              createdAt: now(),
            };
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

  return null;
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
  const delegatesResponse = await retry404(() => rpc.getDelegates(baker));
  return checkForDeactivations({ baker, cycle, delegatesResponse });
};

type CheckForDeactivationsArgs = {
  baker: string;
  cycle: number;
  delegatesResponse: DelegatesResponse;
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
