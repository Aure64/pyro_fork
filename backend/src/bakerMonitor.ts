import { BakerNodeEvent, RpcEvent } from "./types";
import {
  Context,
  PollingSubscribeProvider,
  Subscription,
  TezosToolkit,
} from "@taquito/taquito";
import { BakingRightsResponse, RpcClient } from "@taquito/rpc";
import to from "await-to-js";

type Monitor = {
  subscription: Subscription<string>;
  toolkit: TezosToolkit;
  baker: string;
};

type StartArgs = {
  baker: string;
  rpcNode: string;
  onEvent: (event: BakerNodeEvent | RpcEvent) => void;
};

export const start = ({ baker, rpcNode, onEvent }: StartArgs): Monitor => {
  const toolkit = new TezosToolkit(rpcNode);
  const context = new Context(toolkit.rpc);
  const provider = new PollingSubscribeProvider(context);
  const subscription = provider.subscribe("head");
  const monitor: Monitor = { subscription, toolkit, baker };

  subscription.on("data", async (blockHash) => {
    const events = await checkBlockByHash({
      rpc: monitor.toolkit.rpc,
      baker: monitor.baker,
      blockHash,
    });
    events.map(onEvent);
  });
  subscription.on("error", (error) => {
    onEvent({
      type: "RPC",
      kind: "SUBSCRIPTION_ERROR",
      message: error.message,
    });
  });

  console.log(`Baker monitor started`);

  return monitor;
};

export const halt = (monitor: Monitor): void => {
  console.log(`Halting monitor for baker ${monitor.baker}`);
  monitor.subscription.close();
};

type CheckBlockByHashArgs = {
  rpc: RpcClient;
  baker: string;
  blockHash: string;
};

/**
 * Fetch and analyze the provided block for any significant events for the provided baker.
 */
const checkBlockByHash = async ({
  rpc,
  baker,
  blockHash,
}: CheckBlockByHashArgs): Promise<BakerNodeEvent[]> => {
  const events: BakerNodeEvent[] = [];
  const [metadataError, metadata] = await to(
    rpc.getBlockMetadata({ block: blockHash })
  );
  if (metadataError) {
    events.push({
      type: "BAKER",
      kind: "GET_METADATA_ERROR",
      message: metadataError.message,
      baker,
    });
  } else if (!metadata) {
    events.push({
      type: "BAKER",
      kind: "GET_METADATA_ERROR",
      message: "Error loading block metadata",
      baker,
    });
  }

  if (metadata) {
    const bakingEvent = await getBlockBakingEvents({
      rpc,
      blockBaker: metadata.baker,
      blockLevel: metadata.level.level,
      cycle: metadata.level.cycle,
      baker,
      blockHash,
    });
    if (bakingEvent) events.push(bakingEvent);
  }

  return events;
};

type GetBlockBakingEventsArgs = {
  rpc: RpcClient;
  blockHash: string;
  cycle: number;
  baker: string;
  blockBaker: string;
  blockLevel: number;
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
  const [bakingRightsError, bakingRightsResponse] = await to(
    rpc.getBakingRights(
      {
        max_priority: 0,
        cycle,
        delegate: baker,
      },
      { block: blockHash }
    )
  );

  if (bakingRightsError) {
    return {
      type: "BAKER",
      kind: "GET_BAKING_RIGHTS_ERROR",
      message: bakingRightsError.message,
      baker,
    };
  } else if (!bakingRightsResponse) {
    return {
      type: "BAKER",
      kind: "GET_BAKING_RIGHTS_ERROR",
      message: "Error loading block baking rights",
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
    return {
      type: "BAKER",
      kind: "MISSED_BAKE",
      message: `Baker missed opportunity for block ${blockHash}`,
      baker,
    };
  } else if (bakeResult === "SUCCESS") {
    return {
      type: "BAKER",
      kind: "SUCCESSFUL_BAKE",
      message: `Baker baked for block ${blockHash}`,
      baker,
    };
  }
  return null;
};

type BakeResult = "SUCCESS" | "MISSED" | "NONE";

type CheckBlockBakingRightsArgs = {
  baker: string;
  blockBaker: string;
  blockLevel: number;
  bakingRightsResponse: BakingRightsResponse;
};

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
    // For now just check for missed bakes where baker was the first in line
    if (bakingRights.level === blockLevel && bakingRights.priority === 0) {
      console.log("found baking slot for priority 0");
      // if baker was priority 0 but didn't bake, that opportunity was lost to another baker
      if (blockBaker !== baker) {
        console.log("Missed bake detected");
        return "MISSED";
      } else {
        console.log("Successful bake detected");
        return "SUCCESS";
      }
    }
  }
  return "NONE";
};
