import { BakerNodeEvent, TezosNodeEvent } from "./types";
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
  EndorsingRightsQueryArguments,
  EndorsingRightsResponse,
  OperationEntry,
  OpKind,
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

type GetBakingRights = (
  args: BakingRightsQueryArguments,
  { block }: { block: string }
) => Promise<BakingRightsResponse>;

type GetEndorsingRights = (
  args: EndorsingRightsQueryArguments,
  { block }: { block: string }
) => Promise<EndorsingRightsResponse>;

type GetBlockMetadata = ({
  block,
}: {
  block: string;
}) => Promise<BlockMetadata>;

type GetBlock = ({ block }: { block: string }) => Promise<BlockResponse>;

export type Rpc = {
  getBakingRights: GetBakingRights;
  getEndorsingRights: GetEndorsingRights;
  getBlockMetadata: GetBlockMetadata;
  getBlock: GetBlock;
};

export const start = ({ bakers, rpcNode, onEvent }: StartArgs): Monitor => {
  const toolkit = new TezosToolkit(rpcNode);
  const context = new Context(toolkit.rpc);
  const provider = new PollingSubscribeProvider(context);
  const subscription = provider.subscribe("head");
  const rpc: Rpc = {
    getBakingRights: makeMemoizedGetBakingRights(
      toolkit.rpc.getBakingRights.bind(toolkit.rpc)
    ),
    getEndorsingRights: toolkit.rpc.getEndorsingRights.bind(toolkit.rpc),
    getBlockMetadata: toolkit.rpc.getBlockMetadata.bind(toolkit.rpc),
    getBlock: toolkit.rpc.getBlock.bind(toolkit.rpc),
  };
  const monitor: Monitor = { subscription, bakers };

  subscription.on("data", async (blockHash) => {
    debug(`Subscription received block: ${blockHash}`);

    const events = await checkBlockByHash({
      rpc,
      bakers,
      blockHash,
    });
    events.map(onEvent);
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

type CheckBlockByHashArgs = {
  rpc: Rpc;
  bakers: string[];
  blockHash: string;
};

/**
 * Fetch and analyze the provided block for any significant events for the provided bakers.
 */
const checkBlockByHash = async ({
  rpc,
  bakers,
  blockHash,
}: CheckBlockByHashArgs): Promise<TezosNodeEvent[]> => {
  const events: TezosNodeEvent[] = [];
  const [metadataError, metadata] = await to(
    rpc.getBlockMetadata({ block: blockHash })
  );
  if (metadataError) {
    warn(`Error fetching block metadata: ${metadataError.message}`);
    events.push({
      type: "RPC",
      kind: "GET_METADATA_ERROR",
      message: metadataError.message,
    });
  } else if (!metadata) {
    warn("Error fetching block metadata: no metadata");
    events.push({
      type: "RPC",
      kind: "GET_METADATA_ERROR",
      message: "Error loading block metadata",
    });
  }

  if (metadata) {
    const bakingEventPromises = bakers.map((baker) =>
      getBlockBakingEvents({
        rpc,
        blockBaker: metadata.baker,
        blockLevel: metadata.level.level,
        cycle: metadata.level.cycle,
        baker,
        blockHash,
      })
    );

    const endorsingEventPromises = bakers.map((baker) =>
      getBlockEndorsingEvents({
        rpc,
        blockBaker: metadata.baker,
        blockLevel: metadata.level.level,
        cycle: metadata.level.cycle,
        baker,
        blockHash,
      })
    );
    const allEvents = await Promise.all([
      ...bakingEventPromises,
      ...endorsingEventPromises,
    ]);

    for (const bakingEvent of allEvents) {
      if (bakingEvent) events.push(bakingEvent);
    }
  }

  return events;
};

type GetBlockBakingEventsArgs = {
  rpc: Rpc;
  blockHash: string;
  cycle: number;
  baker: string;
  blockBaker: string;
  blockLevel: number;
};

/**
 * Create a memoized getBakingRights function.  The request memoizes based on cycle and delegate
 * in order to support using it for multiple delegates simultaneously.
 */
export const makeMemoizedGetBakingRights = (
  originalFunction: GetBakingRights
): GetBakingRights => {
  const cache: Record<string, BakingRightsResponse> = {};

  return async (
    args: BakingRightsQueryArguments,
    { block }: { block: string }
  ) => {
    const key = `${args.cycle}:${args.delegate}`;
    if (cache[key]) {
      debug(`Memoized getBakingRights cache hit for ${key}`);
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

/**
 * Fetch the baking rights for the given block to determine if the provided baker had any
 * significant events occur for that block.
 */
export const getBlockBakingEvents = async ({
  blockHash,
  rpc,
  cycle,
  baker,
  blockBaker,
  blockLevel,
}: GetBlockBakingEventsArgs): Promise<BakerNodeEvent | null> => {
  // Taquito currently has a bug that causes it to return all priorities:
  // https://github.com/ecadlabs/taquito/issues/580
  // switch to max_priority: 0 after the bug is fixed
  const [bakingRightsError, bakingRightsResponse] = await to(
    rpc.getBakingRights(
      {
        max_priority: 1,
        cycle,
        delegate: baker,
      },
      { block: blockHash }
    )
  );

  if (bakingRightsError) {
    warn(
      `Baking rights error: ${bakingRightsError.message} for baker ${baker}`
    );
    return {
      type: "BAKER",
      kind: "GET_BAKING_RIGHTS_ERROR",
      message: bakingRightsError.message,
      baker,
    };
  } else if (!bakingRightsResponse) {
    const message = `Error loading block baking rights for baker ${baker}`;
    warn(message);
    return {
      type: "BAKER",
      kind: "GET_BAKING_RIGHTS_ERROR",
      message,
      baker,
    };
  }

  const bakeResult = checkBlockBakingRights({
    baker,
    blockBaker,
    blockLevel,
    bakingRightsResponse,
  });
  if (bakeResult === "MISSED") {
    const message = `Missed bake for block ${blockHash} for baker ${baker}`;
    debug(message);
    return {
      type: "BAKER",
      kind: "MISSED_BAKE",
      message,
      baker,
    };
  } else if (bakeResult === "SUCCESS") {
    const message = `Successful bake for block ${blockHash} for baker ${baker}`;
    debug(message);
    return {
      type: "BAKER",
      kind: "SUCCESSFUL_BAKE",
      message,
      baker,
    };
  }
  debug(`No bake event for block ${blockHash} for baker ${baker}`);
  return null;
};

type BakeResult = "SUCCESS" | "MISSED" | "NONE";

type CheckBlockBakingRightsArgs = {
  baker: string;
  blockBaker: string;
  blockLevel: number;
  bakingRightsResponse: BakingRightsResponse;
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
  bakingRightsResponse,
}: CheckBlockBakingRightsArgs): BakeResult => {
  for (const bakingRights of bakingRightsResponse) {
    if (
      bakingRights.level === blockLevel &&
      bakingRights.priority === priority
    ) {
      debug(`found baking slot for priority ${priority} for baker ${baker}`);
      // if baker was priority 0 but didn't bake, that opportunity was lost to another baker
      if (blockBaker !== baker) {
        info(`Missed bake detected for baker ${baker}`);
        return "MISSED";
      } else {
        info(`Successful bake detected for baker ${baker}`);
        return "SUCCESS";
      }
    }
  }
  return "NONE";
};

type GetBlockEndorsingEventsArgs = {
  rpc: Rpc;
  blockHash: string;
  cycle: number;
  baker: string;
  blockBaker: string;
  blockLevel: number;
};

/**
 * Fetch the endorsing rights for the given block to determine if the provided baker had any
 * significant events occur for that block.
 */
export const getBlockEndorsingEvents = async ({
  blockHash,
  rpc,
  cycle,
  baker,
  blockLevel,
}: GetBlockEndorsingEventsArgs): Promise<BakerNodeEvent | null> => {
  const [endorsingRightsError, endorsingRightsResponse] = await to(
    rpc.getEndorsingRights(
      {
        cycle,
        delegate: baker,
      },
      { block: `${blockLevel - 1}` }
    )
  );

  if (endorsingRightsError) {
    warn(
      `Baking rights error: ${endorsingRightsError.message} for baker ${baker}`
    );
    return {
      type: "BAKER",
      kind: "GET_BAKING_RIGHTS_ERROR",
      message: endorsingRightsError.message,
      baker,
    };
  } else if (!endorsingRightsResponse) {
    const message = `Error loading block endorsing rights for baker ${baker}`;
    warn(message);
    return {
      type: "BAKER",
      kind: "GET_BAKING_RIGHTS_ERROR",
      message,
      baker,
    };
  }

  // taquito currently doesn't expose getBlockOperations
  const [blockError, blockResponse] = await to(
    rpc.getBlock({ block: blockHash })
  );

  if (blockError) {
    warn(`Block operations error: ${blockError.message} for baker ${baker}`);
    return {
      type: "BAKER",
      kind: "GET_BLOCK_OPERATIONS_ERROR",
      message: blockError.message,
      baker,
    };
  } else if (!blockResponse) {
    const message = `Error loading block operations for baker ${baker}`;
    warn(message);
    return {
      type: "BAKER",
      kind: "GET_BLOCK_OPERATIONS_ERROR",
      message,
      baker,
    };
  }

  const endorsementOperations = blockResponse.operations[0];

  const endorseResult = checkBlockEndorsingRights({
    baker,
    blockLevel,
    endorsingRightsResponse,
    endorsementOperations, // endorsements are always in the first group
  });
  if (endorseResult === "MISSED") {
    const message = `Missed endorse for block ${blockHash} for baker ${baker}`;
    debug(message);
    return {
      type: "BAKER",
      kind: "MISSED_ENDORSE",
      message,
      baker,
    };
  } else if (endorseResult === "SUCCESS") {
    const message = `Successful endorse for block ${blockHash} for baker ${baker}`;
    debug(message);
    return {
      type: "BAKER",
      kind: "SUCCESSFUL_ENDORSE",
      message,
      baker,
    };
  }
  debug(`No endorse event for block ${blockHash} for baker ${baker}`);
  return null;
};

type EndorsingResult = "SUCCESS" | "MISSED" | "NONE";

type CheckBlockEndorsingRightsArgs = {
  baker: string;
  endorsementOperations: OperationEntry[];
  blockLevel: number;
  endorsingRightsResponse: EndorsingRightsResponse;
};

/**
 * Check the endorsing rights for a block to see if the provided endorser had a successful or missed endorse.
 */
export const checkBlockEndorsingRights = ({
  baker,
  endorsementOperations,
  blockLevel,
  endorsingRightsResponse,
}: CheckBlockEndorsingRightsArgs): EndorsingResult => {
  const shouldEndorse =
    endorsingRightsResponse.find(
      (right) => right.level === blockLevel - 1 && right.delegate === baker
    ) !== undefined;

  if (shouldEndorse) {
    debug(`found endorsing slot for for baker ${baker}`);
    const didEndorse =
      endorsementOperations.find((op) => isEndorsementByDelegate(op, baker)) !==
      undefined;
    if (didEndorse) {
      info(`Successful endorse detected for baker ${baker}`);
      return "SUCCESS";
    } else {
      info(`Missed endorse detected for baker ${baker}`);
      return "MISSED";
    }
  }

  return "NONE";
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
