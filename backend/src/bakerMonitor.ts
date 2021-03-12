import { BakerNodeEvent, Result, TezosNodeEvent } from "./types";
import { debug, warn, info, trace } from "loglevel";
import {
  Context,
  PollingSubscribeProvider,
  Subscription,
  TezosToolkit,
} from "@taquito/taquito";
import {
  BakingRightsQueryArguments,
  BakingRightsResponse,
  BlockMetadata,
  BlockResponse,
  ConstantsResponse,
  EndorsingRightsResponse,
  OperationEntry,
  OpKind,
  RpcClient,
} from "@taquito/rpc";
import to from "await-to-js";
import * as Config from "./config";
import * as BetterQueue from "better-queue";
import * as SqlLiteStore from "better-queue-sqlite";
import { normalize } from "path";

type Monitor = {
  subscription: Subscription<string>;
  bakers: string[];
  queue: BetterQueue<string>;
};

type StartArgs = {
  bakers: string[];
  rpcNode: string;
  onEvent: (event: TezosNodeEvent) => void;
  storageDirectory: string;
};

export const start = ({
  bakers,
  rpcNode,
  onEvent,
  storageDirectory,
}: StartArgs): Monitor => {
  const toolkit = new TezosToolkit(rpcNode);
  const context = new Context(toolkit.rpc);
  const provider = new PollingSubscribeProvider(context);
  const subscription = provider.subscribe("head");
  const rpc = toolkit.rpc;
  rpc.getBakingRights = makeMemoizedGetBakingRights(
    rpc.getBakingRights.bind(rpc)
  );

  const store = new SqlLiteStore<string>({
    path: normalize(`${storageDirectory}/bakerMonitor.db`),
  });
  const queue = new BetterQueue<string>(
    async (blockId, callback) => {
      const result = await checkBlock({ bakers, rpc, blockId });

      if (result.type === "ERROR") {
        callback(result, null);
        onEvent({
          type: "RPC",
          kind: "ERROR",
          message: result.message,
        });
        callback(result, null);
      } else {
        const { events, blockLevel } = result.data;
        events.map(onEvent);

        const lastBlockLevel = Config.getLastBlockLevel();
        debug(`Previous block level from config: ${lastBlockLevel}`);
        if (lastBlockLevel && blockLevel - lastBlockLevel > 1) {
          for (let i = lastBlockLevel + 1; i < blockLevel; i++) {
            debug(
              `Queue'ing block level ${i} to check for previous baking events`
            );
            queue.push(i.toString());
          }
        }
        if (!lastBlockLevel || blockLevel > lastBlockLevel) {
          debug(`Saving previous block level: ${blockLevel}`);
          // only update last block level if it's bigger.  it could be smaller if this was a catch up event
          Config.setLastBlockLevel(blockLevel);
        }

        callback(null, result);
      }
    },
    { maxRetries: 10, afterProcessDelay: 3000, store, retryDelay: 3000 }
  );

  subscription.on("data", async (blockHash) => {
    debug(`Subscription received block: ${blockHash}`);
    queue.push(blockHash);
  });
  subscription.on("error", (error) => {
    warn(`Baking subscription error: ${error.message}`);
    onEvent({
      type: "RPC",
      kind: "SUBSCRIPTION_ERROR",
      message: error.message,
    });
  });

  debug(`Baker monitor started`);

  const monitor: Monitor = { queue, subscription, bakers };
  return monitor;
};

export const halt = (monitor: Monitor): void => {
  info("Halting baker monitor");
  monitor.subscription.close();
};

type CheckBlockArgs = {
  bakers: string[];
  blockId: string;
  rpc: RpcClient;
};

type CheckBlockResult = {
  events: TezosNodeEvent[];
  blockLevel: number;
};

/**
 * Fetch block data and analyze it for any baking/endorsing related events.
 */
const checkBlock = async ({
  bakers,
  blockId,
  rpc,
}: CheckBlockArgs): Promise<Result<CheckBlockResult>> => {
  const blockResult = await loadBlockData({
    bakers,
    blockId,
    rpc,
  });
  if (blockResult.type === "ERROR") {
    return {
      type: "ERROR",
      message: `Error loading data for block ${blockId}`,
    };
  } else {
    const events: TezosNodeEvent[] = [];

    const {
      metadata,
      block,
      bakingRights,
      endorsingRights,
      constants,
    } = blockResult.data;

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
        blockLevel: metadata.level.level,
        endorsementOperations,
        endorsingRights,
      });
      if (endorsingEvent) events.push(endorsingEvent);
      const futureBakingEvent = checkFutureBlockBakingRights({
        baker,
        bakingRights,
        blockBaker: metadata.baker,
        blockLevel: metadata.level.level,
        timeBetweenBlocks: constants.time_between_blocks[0].toNumber(),
      });
      if (futureBakingEvent) events.push(futureBakingEvent);
      const doubleBakeEvent = await checkBlockAccusationsForDoubleBake({
        baker,
        operations: anonymousOperations,
        rpc,
      });
      if (doubleBakeEvent) {
        events.push(doubleBakeEvent);
      }
      const doubleEndorseEvent = await checkBlockAccusationsForDoubleEndorsement(
        {
          baker,
          operations: anonymousOperations,
          rpc,
        }
      );
      if (doubleEndorseEvent) {
        events.push(doubleEndorseEvent);
      }
      const futureEndorsingEvent = checkFutureBlockEndorsingRights({
        baker,
        endorsingRights,
        blockLevel: metadata.level.level,
        timeBetweenBlocks: constants.time_between_blocks[0].toNumber(),
      });
      if (futureEndorsingEvent) events.push(futureEndorsingEvent);
    }
    const blockLevel = metadata.level.level;
    return { type: "SUCCESS", data: { events, blockLevel } };
  }
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
  constants: ConstantsResponse;
};

/**
 * Fetches block data needed to identify baking events for all bakers.
 */
export const loadBlockData = async ({
  bakers,
  blockId,
  rpc,
}: LoadBlockDataArgs): Promise<Result<BlockData>> => {
  debug(`Fetching block metadata for ${blockId}`);
  const [metadataError, metadata] = await to(
    rpc.getBlockMetadata({ block: blockId })
  );
  if (metadataError) {
    warn(`Error fetching block metadata: ${metadataError.message}`);
    return { type: "ERROR", message: "Error loading block metadata" };
  } else if (!metadata) {
    warn("Error fetching block metadata: no metadata");
    return { type: "ERROR", message: "Error loading block metadata" };
  }

  const bakingRightsPromise = rpc.getBakingRights(
    {
      max_priority: 0,
      cycle: metadata.level.cycle,
      delegate: bakers,
    },
    { block: blockId }
  );

  const endorsingRightsPromise = rpc.getEndorsingRights(
    {
      cycle: metadata.level.cycle,
      delegate: bakers,
    },
    { block: `${metadata.level.level - 1}` }
  );
  const blockPromise = rpc.getBlock({ block: blockId });

  const constantsPromise = rpc.getConstants({ block: blockId });

  // run all promises in parallel
  await Promise.all([
    bakingRightsPromise,
    endorsingRightsPromise,
    blockPromise,
    constantsPromise,
  ]);

  const [constantsError, constants] = await to(constantsPromise);
  if (constantsError) {
    warn(`Error fetching block constants: ${constantsError.message}`);
    return { type: "ERROR", message: "Error loading block constants" };
  } else if (!constants) {
    warn("Error fetching block constants: no constants");
    return { type: "ERROR", message: "Error loading block constants" };
  }

  const [bakingRightsError, bakingRights] = await to(bakingRightsPromise);

  if (bakingRightsError) {
    warn(`Baking rights error: ${bakingRightsError.message}`);
    return { type: "ERROR", message: "Error loading baking rights" };
  } else if (!bakingRights) {
    warn("Baking rights undefined");
    return { type: "ERROR", message: "Error loading baking rights" };
  }

  const [endorsingRightsError, endorsingRights] = await to(
    endorsingRightsPromise
  );

  if (endorsingRightsError) {
    warn(`Endorsing rights error: ${endorsingRightsError.message}`);
    return {
      type: "ERROR",
      message: "Error fetching endorsing rights",
    };
  } else if (!endorsingRights) {
    const message = "Undefined endorsing rights";
    warn(message);
    return {
      type: "ERROR",
      message: "Error fetching endorsing rights",
    };
  }

  // taquito currently doesn't expose getBlockOperations
  const [blockError, block] = await to(blockPromise);

  if (blockError) {
    const message = `Error loading block operations for ${blockId}`;
    warn(`${message} because of ${blockError.message}`);
    return {
      type: "ERROR",
      message,
    };
  } else if (!block) {
    const message = `Error loading block operations for ${blockId}`;
    warn(message);
    return {
      type: "ERROR",
      message,
    };
  }

  return {
    type: "SUCCESS",
    data: { metadata, bakingRights, endorsingRights, block, constants },
  };
};

type GetBakingRights = (
  args: BakingRightsQueryArguments,
  { block }: { block: string }
) => Promise<BakingRightsResponse>;

/**
 * Create a memoized getBakingRights function.  The request memoizes based on cycle.
 */
export const makeMemoizedGetBakingRights = (
  originalFunction: GetBakingRights
): GetBakingRights => {
  const cache: Record<string, BakingRightsResponse> = {};

  return async (
    args: BakingRightsQueryArguments,
    { block }: { block: string }
  ) => {
    const key = `${args.cycle}`;
    if (cache[key]) {
      debug(`Memoized getBakingRights cache hit for cycle ${key}`);
      return cache[key];
    } else {
      debug(`Memoized getBakingRights cache miss for ${key}`);
      const bakingRightsResponse = await originalFunction(args, {
        block,
      });
      cache[key] = bakingRightsResponse;
      return bakingRightsResponse;
    }
  };
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
}: CheckBlockBakingRightsArgs): BakerNodeEvent | null => {
  for (const bakingRight of bakingRights) {
    if (bakingRight.level === blockLevel && bakingRight.priority === priority) {
      debug(`found baking slot for priority ${priority} for baker ${baker}`);
      // if baker was priority 0 but didn't bake, that opportunity was lost to another baker
      if (blockBaker !== baker) {
        const message = `Missed bake detected for baker ${baker}`;
        info(message);
        return {
          type: "BAKER",
          kind: "MISSED_BAKE",
          message,
          baker,
        };
      } else {
        const message = `Successful bake for block ${blockId} for baker ${baker}`;
        debug(message);
        return {
          type: "BAKER",
          kind: "SUCCESSFUL_BAKE",
          message,
          baker,
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
}: CheckBlockEndorsingRightsArgs): BakerNodeEvent | null => {
  const shouldEndorse =
    endorsingRights.find(
      (right) => right.level === blockLevel - 1 && right.delegate === baker
    ) !== undefined;

  if (shouldEndorse) {
    debug(`found endorsing slot for for baker ${baker}`);
    const didEndorse =
      endorsementOperations.find((op) => isEndorsementByDelegate(op, baker)) !==
      undefined;
    if (didEndorse) {
      const message = `Successful endorse for baker ${baker}`;
      debug(message);
      return {
        type: "BAKER",
        kind: "SUCCESSFUL_ENDORSE",
        message,
        baker,
      };
    } else {
      const message = `Missed endorse for baker ${baker}`;
      debug(message);
      return {
        type: "BAKER",
        kind: "MISSED_ENDORSE",
        message,
        baker,
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
    if (contentsItem.kind === OpKind.ENDORSEMENT && "metadata" in contentsItem)
      if (contentsItem.metadata.delegate === delegate) {
        return true;
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
}: CheckBlockAccusationsForDoubleEndorsementArgs): Promise<TezosNodeEvent | null> => {
  for (const operation of operations) {
    for (const contentsItem of operation.contents) {
      if (contentsItem.kind === OpKind.DOUBLE_ENDORSEMENT_EVIDENCE) {
        const accusedLevel = contentsItem.op1.operations.level;
        const accusedSignature = contentsItem.op1.signature;
        const [blockError, blockResult] = await to(
          rpc.getBlock({ block: `${accusedLevel}` })
        );
        if (blockResult) {
          const endorsementOperations = blockResult.operations[0];
          const operation = endorsementOperations.find(
            (operation) => operation.signature === accusedSignature
          );
          const endorser = operation && findEndorserForOperation(operation);
          if (endorser) {
            if (endorser === baker) {
              const message = `Double endorsement for baker ${baker} at block ${blockResult.hash}`;
              info(message);
              return {
                type: "BAKER",
                kind: "DOUBLE_ENDORSE",
                message,
                baker,
              };
            }
          } else {
            warn(
              `Unable to find endorser for double endorsed block ${blockResult.hash}`
            );
          }
        } else if (blockError) {
          warn(
            `Error fetching block info to determine double endorsement violator because of ${blockError.message}`
          );
        } else {
          warn(
            "Error fetching block info to determine double endorsement violator"
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
}: CheckBlockAccusationsForDoubleBakeArgs): Promise<TezosNodeEvent | null> => {
  for (const operation of operations) {
    for (const contentsItem of operation.contents) {
      if (contentsItem.kind === OpKind.DOUBLE_BAKING_EVIDENCE) {
        const accusedHash = operation.hash;
        const accusedLevel = contentsItem.bh1.level;
        const accusedPriority = contentsItem.bh1.priority;
        const [bakingRightsError, bakingRights] = await to(
          rpc.getBakingRights(
            { delegate: baker, level: accusedLevel },
            { block: `${accusedLevel}` }
          )
        );
        if (bakingRights) {
          const hadBakingRights =
            bakingRights.find(
              (right) =>
                right.priority === accusedPriority && right.delegate === baker
            ) !== undefined;
          if (hadBakingRights) {
            const message = `Double bake for baker ${baker} at level ${accusedLevel} with hash ${accusedHash}`;
            info(message);
            return {
              type: "BAKER",
              kind: "DOUBLE_BAKE",
              message,
              baker,
            };
          }
        } else if (bakingRightsError) {
          warn(
            `Error fetching baking rights to determine double bake violator because of ${bakingRightsError.message}`
          );
        } else {
          warn(
            "Error fetching baking rights to determine double bake violator"
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
}: CheckFutureBlockBakingRightsArgs): BakerNodeEvent | null => {
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
          type: "BAKER",
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
}: CheckFutureBlockEndorsingRightsArgs): BakerNodeEvent | null => {
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
        type: "BAKER",
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
