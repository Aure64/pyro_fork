import { BakerEvent, TezosNodeEvent } from "./types";
import { debug, warn, info, trace } from "loglevel";
import {
  BakingRightsQueryArguments,
  BakingRightsResponse,
  BlockMetadata,
  BlockResponse,
  // BlockHeaderResponse,
  ConstantsResponse,
  EndorsingRightsQueryArguments,
  EndorsingRightsResponse,
  OperationEntry,
  OpKind,
  RpcClient,
  DelegatesResponse,
} from "@taquito/rpc";
import { wrap2 } from "./networkWrapper";
import { Config } from "./config";
import { makeMemoizedAsyncFunction } from "./memoization";

const sleep = (milliseconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

type Monitor = {
  halt: () => void;
  bakers: string[];
};

type StartArgs = {
  bakers: string[];
  onEvent: (event: TezosNodeEvent) => void;
  config: Config;
};

export const start = async ({
  bakers,
  onEvent,
  config,
}: StartArgs): Promise<Monitor> => {
  const rpcNode = config.getRpc();

  const rpc = new RpcClient(rpcNode);

  rpc.getBakingRights = makeMemoizedAsyncFunction(
    rpc.getBakingRights.bind(rpc),
    (args: BakingRightsQueryArguments) => `${args.cycle}`,
    10
  );
  rpc.getEndorsingRights = makeMemoizedAsyncFunction(
    rpc.getEndorsingRights.bind(rpc),
    (args: EndorsingRightsQueryArguments) => `${args.cycle}`,
    10
  );

  const constants = await wrap2(() => rpc.getConstants());

  debug(`Baker monitor started`);

  let halted = false;

  while (!halted) {
    try {
      const lastBlockLevel = config.getLastBlockLevel();
      const catchupLimit = config.getBakerCatchupLimit();
      const lastBlockCycle = config.getLastBlockCycle();
      const headHeader = await rpc.getBlockHeader();
      const { level, hash } = headHeader;
      debug(
        `Got block ${hash} at level ${level} [currently at ${lastBlockLevel}]`
      );

      const minLevel = catchupLimit ? level - catchupLimit : level;
      const startLevel = lastBlockLevel
        ? Math.max(lastBlockLevel + 1, minLevel)
        : level;

      debug(`Processing blocks starting at level ${startLevel}`);

      let currentLevel = startLevel;

      while (currentLevel <= level) {
        debug(`Processing block at level ${currentLevel}`);
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
        events.map(onEvent);
        config.setLastBlockLevel(currentLevel);
        config.setLastBlockCycle(blockCycle);
        currentLevel++;
        await sleep(1000);
      }
    } catch (err) {
      warn("RPC Error:", err);
      onEvent({
        type: "BAKER_DATA",
        kind: "ERROR",
        message: err.message,
      });
    }
    await sleep(1000 * constants.time_between_blocks[0].toNumber());
  }

  const halt = () => {
    info("Halting baker monitor");
    halted = true;
  };

  const monitor: Monitor = { bakers, halt };
  return monitor;
};

type CheckBlockArgs = {
  bakers: string[];
  blockId: string;
  rpc: RpcClient;
  lastCycle: number | undefined;
  constants: ConstantsResponse;
};

type CheckBlockResult = {
  events: TezosNodeEvent[];
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
  trace(`Fetching baker data for block ${blockId}`);
  const events: TezosNodeEvent[] = [];

  const {
    metadata,
    block,
    bakingRights,
    endorsingRights,
  } = await loadBlockData({
    bakers,
    blockId,
    rpc,
  });

  trace(`Successfully retrieved baker data for block ${blockId}`);

  if (!metadata.level) {
    throw new Error(`Missing block metadata level`);
  }

  const blockLevel = metadata.level.level;
  const blockCycle = metadata.level.cycle;

  for (const baker of bakers) {
    const endorsementOperations = block.operations[0];
    const anonymousOperations = block.operations[2];
    const bakingEvent = checkBlockBakingRights({
      baker,
      bakingRights,
      blockBaker: metadata.baker,
      blockId,
      blockLevel: metadata.level.level,
    });
    if (bakingEvent) events.push(bakingEvent);
    const endorsingEvent = checkBlockEndorsingRights({
      baker,
      blockLevel: metadata.level.level - 1,
      endorsementOperations,
      endorsingRights,
    });
    if (endorsingEvent) events.push(endorsingEvent);
    // only check future rights once per block
    if (!lastCycle || blockCycle > lastCycle) {
      const futureBakingEvent = checkFutureBlockBakingRights({
        baker,
        bakingRights,
        blockBaker: metadata.baker,
        blockLevel: metadata.level.level,
        timeBetweenBlocks: constants.time_between_blocks[0].toNumber(),
      });
      if (futureBakingEvent) events.push(futureBakingEvent);
      const futureEndorsingEvent = checkFutureBlockEndorsingRights({
        baker,
        endorsingRights,
        blockLevel: metadata.level.level,
        timeBetweenBlocks: constants.time_between_blocks[0].toNumber(),
      });
      const deactivationEvent = await getDeactivationEvent({
        baker,
        rpc,
        cycle: metadata.level.cycle,
      });
      if (deactivationEvent) events.push(deactivationEvent);
      if (futureEndorsingEvent) events.push(futureEndorsingEvent);
    } else {
      debug(
        `Not checking for future rights or deactivations as this cycle (${blockCycle}) was already checked`
      );
    }
    const doubleBakeEvent = await checkBlockAccusationsForDoubleBake({
      baker,
      operations: anonymousOperations,
      rpc,
      blockLevel: metadata.level.level,
    });
    if (doubleBakeEvent) {
      events.push(doubleBakeEvent);
    }
    const doubleEndorseEvent = await checkBlockAccusationsForDoubleEndorsement({
      baker,
      operations: anonymousOperations,
      rpc,
      blockLevel: metadata.level.level,
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
  bakers: string[];
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
  bakers,
  blockId,
  rpc,
}: LoadBlockDataArgs): Promise<BlockData> => {
  debug(`Fetching block ${blockId}`);
  const blockPromise = wrap2(() => rpc.getBlock({ block: blockId }));
  const block = await blockPromise;

  debug(`Block ${blockId} is at level`, block.metadata.level);
  const cycle = block.metadata.level?.cycle;

  const bakingRightsPromise = wrap2(() =>
    rpc.getBakingRights(
      {
        max_priority: 0,
        cycle,
        delegate: bakers,
      },
      { block: blockId }
    )
  );

  const endorsingRightsPromise = wrap2(() =>
    rpc.getEndorsingRights(
      {
        cycle,
        delegate: bakers,
      },
      { block: blockId }
    )
  );

  const [bakingRights, endorsingRights] = await Promise.all([
    bakingRightsPromise,
    endorsingRightsPromise,
  ]);

  return { metadata: block.metadata, bakingRights, endorsingRights, block };
};

type CheckBlockBakingRightsArgs = {
  baker: string;
  blockBaker: string;
  blockId: string;
  blockLevel: number;
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
  blockLevel,
  bakingRights,
  blockId,
}: CheckBlockBakingRightsArgs): BakerEvent | null => {
  for (const bakingRight of bakingRights) {
    if (
      bakingRight.delegate === baker &&
      bakingRight.level === blockLevel &&
      bakingRight.priority === priority
    ) {
      debug(`found baking slot for priority ${priority} for baker ${baker}`);
      // if baker was priority 0 but didn't bake, that opportunity was lost to another baker
      if (blockBaker !== baker) {
        const message = `Missed bake detected for baker ${baker}`;
        info(message);
        return {
          type: "BAKER_NODE",
          kind: "MISSED_BAKE",
          message,
          baker,
          blockLevel,
        };
      } else {
        const message = `Successful bake for block ${blockId} for baker ${baker}`;
        debug(message);
        return {
          type: "BAKER_NODE",
          kind: "SUCCESSFUL_BAKE",
          message,
          baker,
          blockLevel,
        };
      }
    }
  }

  debug(`No bake event for block ${blockId} for baker ${baker}`);
  return null;
};

type CheckBlockEndorsingRightsArgs = {
  baker: string;
  endorsementOperations: OperationEntry[];
  blockLevel: number;
  endorsingRights: EndorsingRightsResponse;
};

/**
 * Check the endorsing rights for a block to see if the provided endorser had a successful or missed endorse.
 */
export const checkBlockEndorsingRights = ({
  baker,
  endorsementOperations,
  blockLevel,
  endorsingRights,
}: CheckBlockEndorsingRightsArgs): BakerEvent | null => {
  const endorsingRight = endorsingRights.find(
    (right) => right.level === blockLevel && right.delegate === baker
  );
  const shouldEndorse = endorsingRight !== undefined;

  if (shouldEndorse) {
    debug(`found endorsing slot for baker ${baker} at level ${blockLevel}`);
    const didEndorse =
      endorsementOperations.find((op) => isEndorsementByDelegate(op, baker)) !==
      undefined;
    if (didEndorse) {
      const message = `Successful endorse for baker ${baker}`;
      debug(message);
      return {
        type: "BAKER_NODE",
        kind: "SUCCESSFUL_ENDORSE",
        message,
        baker,
        blockLevel,
      };
    } else {
      const message = `Missed endorse for baker ${baker} at level ${blockLevel}`;
      debug(message);
      return {
        type: "BAKER_NODE",
        kind: "MISSED_ENDORSE",
        message,
        baker,
        blockLevel,
      };
    }
  }

  debug(`No endorse event for baker ${baker}`);
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
  blockLevel: number;
};

export const checkBlockAccusationsForDoubleEndorsement = async ({
  baker,
  operations,
  rpc,
  blockLevel,
}: CheckBlockAccusationsForDoubleEndorsementArgs): Promise<TezosNodeEvent | null> => {
  for (const operation of operations) {
    for (const contentsItem of operation.contents) {
      if (contentsItem.kind === OpKind.DOUBLE_ENDORSEMENT_EVIDENCE) {
        const accusedLevel = contentsItem.op1.operations.level;
        const accusedSignature = contentsItem.op1.signature;
        try {
          const block = await wrap2(() =>
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
              const message = `Double endorsement for baker ${baker} at block ${block.hash}`;
              info(message);
              return {
                type: "BAKER_NODE",
                kind: "DOUBLE_ENDORSE",
                message,
                baker,
                blockLevel,
              };
            }
          } else {
            warn(
              `Unable to find endorser for double endorsed block ${block.hash}`
            );
          }
        } catch (err) {
          warn(
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
  blockLevel: number;
};

export const checkBlockAccusationsForDoubleBake = async ({
  baker,
  operations,
  rpc,
  blockLevel,
}: CheckBlockAccusationsForDoubleBakeArgs): Promise<TezosNodeEvent | null> => {
  for (const operation of operations) {
    for (const contentsItem of operation.contents) {
      if (contentsItem.kind === OpKind.DOUBLE_BAKING_EVIDENCE) {
        const accusedHash = operation.hash;
        const accusedLevel = contentsItem.bh1.level;
        const accusedPriority = contentsItem.bh1.priority;
        try {
          const bakingRights = await wrap2(() =>
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
            const message = `Double bake for baker ${baker} at level ${accusedLevel} with hash ${accusedHash}`;
            info(message);
            return {
              type: "BAKER_NODE",
              kind: "DOUBLE_BAKE",
              message,
              baker,
              blockLevel,
            };
          }
        } catch (err) {
          warn(
            `Error fetching baking rights to determine double bake violator because of `,
            err
          );
        }
      }
    }
  }

  return null;
};

type CheckFutureBlockBakingRightsArgs = {
  baker: string;
  blockBaker: string;
  blockLevel: number;
  bakingRights: BakingRightsResponse;
  timeBetweenBlocks: number;
};
/**
 * Check the baking rights for a future baking opportunity.  Returns the earliest opportunity found or null if
 * there are none.
 */
export const checkFutureBlockBakingRights = ({
  baker,
  blockLevel,
  bakingRights,
  timeBetweenBlocks,
}: CheckFutureBlockBakingRightsArgs): BakerEvent | null => {
  for (const bakingRight of bakingRights) {
    if (bakingRight.level > blockLevel && bakingRight.priority === 0) {
      const delegate = bakingRight.delegate;
      trace(`found future baking slot for priority 0 for baker ${delegate}`);
      // if baker was priority 0 but didn't bake, that opportunity was lost to another baker
      if (delegate === baker) {
        const numBlocksUntilBake = bakingRight.level - blockLevel;
        const secondsUntilBake = numBlocksUntilBake * timeBetweenBlocks;
        const now = Date.now();
        const date = new Date(now + secondsUntilBake * 1000);
        const level = bakingRight.level;
        const message = `Future bake opportunity for baker ${baker} at level ${level} in ${numBlocksUntilBake} blocks on ${date}`;
        info(message);
        return {
          type: "FUTURE_BAKING",
          kind: "FUTURE_BAKING_OPPORTUNITY",
          message,
          baker,
          level,
          date,
        };
      } else {
        trace(
          `Other delegate ${delegate} has priority 0, not monitored baker ${baker}`
        );
      }
    }
  }

  debug(`No future baking opportunties for baker ${baker}`);
  return null;
};

type CheckFutureBlockEndorsingRightsArgs = {
  baker: string;
  blockLevel: number;
  endorsingRights: EndorsingRightsResponse;
  timeBetweenBlocks: number;
};
/**
 * Check the endorsing rights for a future endorsing opportunity.  Returns the earliest opportunity found or
 * null if there are none.
 */
export const checkFutureBlockEndorsingRights = ({
  baker,
  blockLevel,
  endorsingRights,
  timeBetweenBlocks,
}: CheckFutureBlockEndorsingRightsArgs): BakerEvent | null => {
  for (const endorsingRight of endorsingRights) {
    if (
      endorsingRight.level > blockLevel &&
      endorsingRight.delegate === baker
    ) {
      const numBlocksUntilBake = endorsingRight.level - blockLevel;
      const secondsUntilBake = numBlocksUntilBake * timeBetweenBlocks;
      const now = Date.now();
      const date = new Date(now + secondsUntilBake * 1000);
      const level = endorsingRight.level;
      const message = `Future endorse opportunity for baker ${baker} at level ${level} in ${numBlocksUntilBake} blocks on ${date}`;
      info(message);
      return {
        type: "FUTURE_BAKING",
        kind: "FUTURE_ENDORSING_OPPORTUNITY",
        message,
        baker,
        level,
        date,
      };
    }
  }

  debug(`No future endorsing opportunties for baker ${baker}`);
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
}: GetDeactivationEventsArgs): Promise<TezosNodeEvent | null> => {
  const delegatesResponse = await wrap2(() => rpc.getDelegates(baker));
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
}: CheckForDeactivationsArgs): Promise<TezosNodeEvent | null> => {
  if (delegatesResponse.deactivated) {
    const message = `Baker ${baker} is deactivated (on or before cycle ${cycle})`;
    debug(message);
    return {
      type: "BAKER_DEACTIVATION",
      kind: "BAKER_DEACTIVATED",
      baker,
      cycle,
      message,
    };
  } else if (delegatesResponse.grace_period - cycle <= 1) {
    const message = `Baker ${baker} is scheduled for deactivation in cycle ${delegatesResponse.grace_period}`;
    debug(message);
    return {
      type: "BAKER_DEACTIVATION",
      kind: "BAKER_PENDING_DEACTIVATION",
      baker,
      cycle: delegatesResponse.grace_period,
      message,
    };
  } else {
    const message = `Baker ${baker} is not at risk of deactivation`;
    debug(message);
  }

  return null;
};
