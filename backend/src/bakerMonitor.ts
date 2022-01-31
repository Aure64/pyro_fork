//import { BakerEvent, TezosNodeEvent } from "./types";
import {
  BakerEvent,
  BakerBlockEvent,
  Deactivated,
  DeactivationRisk,
  Event,
  Events,
} from "./events";
import { getLogger } from "loglevel";

import {
  BakingRightsResponse,
  BlockResponse,
  EndorsingRightsResponse,
  OperationEntry,
  OpKind,
  RpcClient,
  DelegatesResponse,
  BakingRightsResponseItem,
} from "@taquito/rpc";

import NRpc from "./rpc/client";

import { retry404, tryForever } from "./rpc/util";

import { delay } from "./delay";

import * as service from "./service";
import * as storage from "./storage";

import now from "./now";
import * as format from "./format";
import * as EventLog from "./eventlog";

import { join as joinPath } from "path";

const name = "bm";

type URL = string;

export type BakerMonitorConfig = {
  bakers: string[];
  rpc: URL;
  max_catchup_blocks: number;
  head_distance: number;
};

type ChainPositionInfo = { blockLevel: number; blockCycle: number };

export type BakerInfo = {
  address: string;
  recentEvents: () => Promise<BakerBlockEvent[]>;
};

export type LastProcessed = {
  cycle: number;
  level: number;
};

export type BakerMonitorInfo = {
  bakerInfo: BakerInfo[];
  lastProcessed?: LastProcessed;
  headDistance: number;
};

export type BakerInfoCollection = { info: () => Promise<BakerMonitorInfo> };

export type BakerMonitor = service.Service & BakerInfoCollection;

const MAX_HISTORY = 7;

export const create = async (
  storageDirectory: string,
  {
    bakers,
    rpc: rpcUrl,
    max_catchup_blocks: catchupLimit,
    head_distance: headDistance,
  }: BakerMonitorConfig,
  enableHistory: boolean,
  onEvent: (event: Event) => Promise<void>
): Promise<BakerMonitor> => {
  //dedup
  bakers = [...new Set(bakers)];

  const log = getLogger(name);
  const rpc = new RpcClient(rpcUrl);
  const nRpc = NRpc(rpcUrl);

  const chainId = await tryForever(
    () => rpc.getChainId(),
    60e3,
    "get chain id"
  );

  log.info(`Chain: ${chainId}`);
  const constants = await tryForever(
    () => nRpc.getConstants(),
    60e3,
    "get protocol constants"
  );

  log.info("Protocol constants", JSON.stringify(constants, null, 2));

  const CHAIN_POSITION_KEY = "position";

  const store = await storage.open([
    storageDirectory,
    "baker-monitor",
    chainId,
  ]);

  const bakerEventLogs: { [key: string]: EventLog.EventLog<BakerBlockEvent> } =
    {};
  const historyDir = joinPath(storageDirectory, "history");
  for (const baker of bakers) {
    bakerEventLogs[baker] = await EventLog.open(historyDir, baker, MAX_HISTORY);
  }

  const addToHistory = async (event: BakerBlockEvent) => {
    let bakerLog = bakerEventLogs[event.baker];
    if (!bakerLog) {
      bakerLog = await EventLog.open(historyDir, event.baker, 5);
      bakerEventLogs[event.baker] = bakerLog;
    }
    bakerLog.add(event);
  };

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
      log.debug(`Getting block header for head~${headDistance}`);
      const headMinusXHeader = await rpc.getBlockHeader({
        block: `head~${headDistance}`,
      });

      const { level, hash } = headMinusXHeader;
      if (log.getLevel() <= 1) {
        const headHeader = await rpc.getBlockHeader();
        const { level: headLevel } = headHeader;
        log.debug(
          `Got block ${hash} at level ${level} [currently at ${lastBlockLevel}, head is ${headLevel}]`
        );
      }

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
          if ("level" in event && enableHistory) {
            await addToHistory(event);
          }
        }
        await setPosition({ blockLevel: currentLevel, blockCycle });
        currentLevel++;
        lastBlockCycle = blockCycle;
        await delay(1000);
      }
    } catch (err) {
      if (err.name === "HttpRequestFailed") {
        log.warn("RPC Error:", err.message);
      } else {
        log.warn("RPC Error:", err);
      }
    }
  };

  const interval = 1000 * (parseInt(constants.minimal_block_delay) || 30);

  const srv = service.create(name, task, interval);

  const bakerInfo: BakerInfo[] = [];
  for (const [baker, bakerEventLog] of Object.entries(bakerEventLogs)) {
    const recentEvents: BakerBlockEvent[] = [];
    for await (const record of bakerEventLog.readFrom(-MAX_HISTORY)) {
      recentEvents.push(record.value);
    }
    bakerInfo.push({
      address: baker,
      recentEvents: async () => {
        const recentEvents: BakerBlockEvent[] = [];
        for await (const record of bakerEventLog.readFrom(-MAX_HISTORY)) {
          recentEvents.push(record.value);
        }
        return recentEvents;
      },
    });
  }

  const info = async () => {
    const chainPosition = await getPosition();
    const lastBlockLevel = chainPosition.blockLevel;
    const lastBlockCycle = chainPosition.blockCycle;

    return {
      bakerInfo,
      lastProcessed:
        lastBlockLevel > 0
          ? { level: lastBlockLevel, cycle: lastBlockCycle }
          : undefined,
      headDistance,
    };
  };

  return {
    name: srv.name,
    start: srv.start,
    stop: srv.stop,
    info,
  };
};

type CheckBlockArgs = {
  bakers: string[];
  blockId: string;
  rpc: RpcClient;
  lastCycle: number | undefined;
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
}: CheckBlockArgs): Promise<CheckBlockResult> => {
  const log = getLogger(name);
  log.trace(`Fetching baker data for block ${blockId}`);
  const events: BakerEvent[] = [];

  const { block, bakingRights, endorsingRights } = await loadBlockData({
    blockId,
    rpc,
  });

  const metadata = block.metadata;

  log.trace(`Successfully retrieved baker data for block ${blockId}`, metadata);

  if (!metadata.level_info) {
    log.error("No level info in metadata", metadata);
    throw new Error(`Missing block metadata level`);
  }

  const blockLevel = metadata.level_info.level;
  const blockCycle = metadata.level_info.cycle;
  const blockTimestamp = new Date(block.header.timestamp);
  const priority = block.header.priority;

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

  const bakingRightForBlock = bakingRights.find(
    (bakingRight) =>
      bakingRight.priority === priority && bakingRight.level === blockLevel
  );
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

type LoadBlockDataArgs = {
  blockId: string;
  rpc: RpcClient;
};

type BlockData = {
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
        max_priority: block.header.priority,
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

  return { bakingRights, endorsingRights, block };
};

type CheckBlockBakingRightsArgs = {
  baker: string;
  blockBaker: string;
  blockId: string;
  bakingRight: BakingRightsResponseItem;
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
