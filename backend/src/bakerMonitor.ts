import { join as joinPath } from "path";
import { getLogger } from "loglevel";

import { BakerBlockEvent, Event, BakerEvent } from "./events";

import { tryForever } from "./rpc/util";

import { delay } from "./delay";

import * as service from "./service";
import * as storage from "./storage";

import * as format from "./format";
import * as EventLog from "./eventlog";

import RpcClient from "./rpc/client";

import { URL } from "./rpc/types";

import protocolH from "./bm-proto-h";
import protocolI from "./bm-proto-i";

const name = "bm";

export type BakerMonitorConfig = {
  bakers: string[];
  rpc: URL;
  max_catchup_blocks: number;
  head_distance: number;
};

type ChainPositionInfo = {
  blockLevel: number;
  blockCycle: number;
  cyclePosition?: number;
};

export type BakerInfo = {
  address: string;
  recentEvents: () => Promise<BakerBlockEvent[]>;
};

export type LastProcessed = {
  cycle: number;
  level: number;
  cyclePosition: number;
};

export type BakerMonitorInfo = {
  bakerInfo: BakerInfo[];
  lastProcessed?: LastProcessed;
  headDistance: number;
  blocksPerCycle: number;
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
  // const rpc = new RpcClient(rpcUrl);
  const rpc = RpcClient(rpcUrl);

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
      cyclePosition: -1,
    })) as ChainPositionInfo;

  const setPosition = async (value: ChainPositionInfo) =>
    await store.put(CHAIN_POSITION_KEY, value);

  const task = async (isInterrupted: () => boolean) => {
    try {
      const chainPosition = await getPosition();
      const lastBlockLevel = chainPosition.blockLevel;
      let lastBlockCycle = chainPosition.blockCycle;
      log.debug(`Getting block header for head~${headDistance}`);
      // const headMinusXHeader = await rpc.getBlockHeader({
      //   block: `head~${headDistance}`,
      // });

      const headMinusXHeader = await rpc.getBlockHeader(`head~${headDistance}`);

      const { level, hash } = headMinusXHeader;
      if (log.getLevel() <= 1) {
        // const headHeader = await rpc.getBlockHeader();
        const headHeader = await rpc.getBlockHeader("head");
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
        const block = await rpc.getBlock(`${currentLevel}`);

        if (block === undefined)
          throw new Error(`Block ${currentLevel} not found`);

        const { metadata } = block;

        if (metadata === undefined)
          throw new Error(
            `Block ${block.hash} at level ${currentLevel} has no metadata`
          );

        if (metadata.level_info === undefined)
          throw new Error(
            `Metadata for block ${block.hash} at level ${currentLevel} has no level info`
          );

        const blockLevel = metadata.level_info.level;
        const blockCycle = metadata.level_info.cycle;
        const cyclePosition = metadata.level_info.cycle_position;

        if (blockLevel !== currentLevel) {
          throw new Error(
            `Block level ${currentLevel} was requested but data returned level ${blockLevel}`
          );
        }

        let events: BakerEvent[];

        switch (block.protocol) {
          case "PtHangz2aRngywmSRGGvrcTyMbbdpWdpFKuS4uMWxg2RaH9i1qx":
            events = await protocolH({
              bakers,
              block,
              rpc: rpc,
              lastCycle: lastBlockCycle,
            });
            break;
          case "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A":
            events = await protocolI({
              bakers,
              block,
              rpc: rpc,
              lastCycle: lastBlockCycle,
            });
            break;
          default:
            console.warn(`Unknown protocol at level ${blockLevel}`);
            events = [];
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
        await setPosition({
          blockLevel: currentLevel,
          blockCycle,
          cyclePosition,
        });
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
    const cyclePosition = chainPosition.cyclePosition || 0;

    return {
      bakerInfo,
      lastProcessed:
        lastBlockLevel > 0
          ? { level: lastBlockLevel, cycle: lastBlockCycle, cyclePosition }
          : undefined,
      headDistance,
      blocksPerCycle: constants.blocks_per_cycle,
    };
  };

  return {
    name: srv.name,
    start: srv.start,
    stop: srv.stop,
    info,
  };
};
