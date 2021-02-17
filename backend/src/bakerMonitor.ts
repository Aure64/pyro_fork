import { BakerNodeEvent, Result, TezosNodeEvent } from "./types";
import { debug, warn, info } from "loglevel";
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
  EndorsingRightsResponse,
  OperationEntry,
  OpKind,
  RpcClient,
} from "@taquito/rpc";
import to from "await-to-js";

type Monitor = {
  subscription: Subscription<string>;
  bakers: string[];
};

type StartArgs = {
  bakers: string[];
  rpcNode: string;
  onEvent: (event: TezosNodeEvent) => void;
};

export const start = ({ bakers, rpcNode, onEvent }: StartArgs): Monitor => {
  const toolkit = new TezosToolkit(rpcNode);
  const context = new Context(toolkit.rpc);
  const provider = new PollingSubscribeProvider(context);
  const subscription = provider.subscribe("head");
  const rpc = toolkit.rpc;
  rpc.getBakingRights = makeMemoizedGetBakingRights(
    rpc.getBakingRights.bind(rpc)
  );
  const monitor: Monitor = { subscription, bakers };

  subscription.on("data", async (blockHash) => {
    debug(`Subscription received block: ${blockHash}`);

    const blockResult = await loadBlockData({
      bakers,
      blockHash,
      rpc,
    });
    if (blockResult.type === "ERROR") {
      onEvent({
        type: "RPC",
        kind: "SUBSCRIPTION_ERROR",
        message: `Error loading data for block ${blockHash}`,
      });
    } else {
      const {
        metadata,
        block,
        bakingRights,
        endorsingRights,
      } = blockResult.data;

      for (const baker of bakers) {
        const bakingEvent = checkBlockBakingRights({
          baker,
          bakingRights,
          blockBaker: metadata.baker,
          blockHash,
          blockLevel: metadata.level.level,
        });
        if (bakingEvent) onEvent(bakingEvent);
        const endorsingEvent = checkBlockEndorsingRights({
          baker,
          blockLevel: metadata.level.level,
          endorsementOperations: block.operations[0],
          endorsingRights,
          blockHash,
        });
        if (endorsingEvent) onEvent(endorsingEvent);
      }
    }
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

  return monitor;
};

export const halt = (monitor: Monitor): void => {
  info("Halting baker monitor");
  monitor.subscription.close();
};

type LoadBlockDataArgs = {
  blockHash: string;
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
  blockHash,
  rpc,
}: LoadBlockDataArgs): Promise<Result<BlockData>> => {
  const [metadataError, metadata] = await to(
    rpc.getBlockMetadata({ block: blockHash })
  );
  if (metadataError) {
    warn(`Error fetching block metadata: ${metadataError.message}`);
    return { type: "ERROR", message: "Error loading block metadata" };
  } else if (!metadata) {
    warn("Error fetching block metadata: no metadata");
    return { type: "ERROR", message: "Error loading block metadata" };
  }

  // Taquito currently has a bug that causes it to return all priorities:
  // https://github.com/ecadlabs/taquito/issues/580
  // switch to max_priority: 0 after the bug is fixed
  const bakingRightsPromise = rpc.getBakingRights(
    {
      max_priority: 1,
      cycle: metadata.level.cycle,
      delegate: bakers,
    },
    { block: blockHash }
  );

  const endorsingRightsPromise = rpc.getEndorsingRights(
    {
      cycle: metadata.level.cycle,
      delegate: bakers,
    },
    { block: `${metadata.level.level - 1}` }
  );
  const blockPromise = rpc.getBlock({ block: blockHash });

  // run all promises in parallel
  await Promise.all([
    bakingRightsPromise,
    endorsingRightsPromise,
    blockPromise,
  ]);

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
    const message = `Error loading block operations for ${blockHash}`;
    warn(`${message} because of ${blockError.message}`);
    return {
      type: "ERROR",
      message,
    };
  } else if (!block) {
    const message = `Error loading block operations for ${blockHash}`;
    warn(message);
    return {
      type: "ERROR",
      message,
    };
  }

  return {
    type: "SUCCESS",
    data: { metadata, bakingRights, endorsingRights, block },
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
  blockHash: string;
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
  blockHash,
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
        const message = `Successful bake for block ${blockHash} for baker ${baker}`;
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

  debug(`No bake event for block ${blockHash} for baker ${baker}`);
  return null;
};

type CheckBlockEndorsingRightsArgs = {
  baker: string;
  endorsementOperations: OperationEntry[];
  blockLevel: number;
  endorsingRights: EndorsingRightsResponse;
  blockHash: string;
};

/**
 * Check the endorsing rights for a block to see if the provided endorser had a successful or missed endorse.
 */
export const checkBlockEndorsingRights = ({
  baker,
  endorsementOperations,
  blockLevel,
  endorsingRights,
  blockHash,
}: CheckBlockEndorsingRightsArgs): BakerNodeEvent | null => {
  const shouldEndorse =
    endorsingRights.find(
      (right) => right.level === blockLevel - 1 && right.delegate === baker
    ) !== undefined;

  if (shouldEndorse) {
    debug(`found endorsing slot for for baker ${baker}`);
    const endorsements = endorsementOperations.filter((op) =>
      isEndorsementByDelegate(op, baker)
    );
    const didEndorse = endorsements.length > 0;
    const doubleEndorsed = endorsements.length > 1;
    if (doubleEndorsed) {
      const message = `Double endorsement for baker ${baker} at block ${blockHash}`;
      debug(message);
      return {
        type: "BAKER",
        kind: "DOUBLE_ENDORSE",
        message,
        baker,
      };
    } else if (didEndorse) {
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
