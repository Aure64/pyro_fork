import { join as joinPath } from "path";
import { getLogger } from "loglevel";

import { BakerBlockEvent, Event, BakerEvent } from "./events";

import { tryForever, HttpResponseError } from "./rpc/util";

import { delay } from "./delay";

import * as service from "./service";
import * as storage from "./storage";

import * as format from "./format";
import * as EventLog from "./eventlog";

import RpcClient, { RpcClientConfig } from "./rpc/client";

import { URL, TzAddress } from "./rpc/types";
import {
  Deactivated,
  DeactivationRisk,
  Events,
  BakerHealthEvent,
} from "./events";
import { Delegate } from "./rpc/types";
import now from "./now";

import protocolH from "./bm-proto-h";
import protocolI from "./bm-proto-i";
import protocolJ from "./bm-proto-j";
import protocolK from "./bm-proto-k";
import protocolL from "./bm-proto-l";
import protocolM from "./bm-proto-m";

const name = "bm";

export type BakerMonitorConfig = {
  bakers: string[];
  rpc: URL;
  max_catchup_blocks: number;
  head_distance: number;
  missed_threshold: number;
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
  atRiskThreshold: number;
};

export type BakerInfoCollection = { info: () => Promise<BakerMonitorInfo> };

export type BakerMonitor = service.Service & BakerInfoCollection;

const MAX_HISTORY = 7;

const missedKinds = new Set<Events>([
  Events.MissedBake,
  Events.MissedBonus,
  Events.MissedEndorsement,
]);

const successKinds = new Set<Events>([Events.Baked, Events.Endorsed]);

export const create = async (
  storageDirectory: string,
  {
    bakers,
    rpc: rpcUrl,
    max_catchup_blocks: catchupLimit,
    head_distance: headDistance,
    missed_threshold: missedEventsThreshold,
  }: BakerMonitorConfig,
  rpcConfig: RpcClientConfig,
  enableHistory: boolean,
  onEvent: (event: Event) => Promise<void>
): Promise<BakerMonitor> => {
  //dedup
  bakers = [...new Set(bakers)];

  const log = getLogger(name);
  // const rpc = new RpcClient(rpcUrl);
  const rpc = RpcClient(rpcUrl, rpcConfig);

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

  const bakerEventLogs: {
    [key: string]: EventLog.EventLog<BakerBlockEvent>;
  } = {};

  const getBakerEventLog = async (
    baker: TzAddress
  ): Promise<EventLog.EventLog<BakerBlockEvent>> => {
    let bakerLog = bakerEventLogs[baker];
    if (!bakerLog) {
      bakerLog = await EventLog.open(historyDir, baker, MAX_HISTORY);
      bakerEventLogs[baker] = bakerLog;
    }
    return bakerLog;
  };

  const historyDir = joinPath(storageDirectory, "history");
  for (const baker of bakers) {
    bakerEventLogs[baker] = await EventLog.open(historyDir, baker, MAX_HISTORY);
  }

  const addToHistory = async (event: BakerBlockEvent) => {
    const bakerLog = await getBakerEventLog(event.baker);
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

  const atRiskThreshold = constants.preserved_cycles - 1;

  const missedCounts = new Map<TzAddress, number>();

  const task = async (isInterrupted: () => boolean) => {
    try {
      const chainPosition = await getPosition();
      const lastBlockLevel = chainPosition.blockLevel;
      let lastBlockCycle = chainPosition.blockCycle;
      log.debug(`Getting block header for head~${headDistance}`);

      const headMinusXHeader = await rpc.getBlockHeader(`head~${headDistance}`);

      const { level, hash } = headMinusXHeader;
      if (log.getLevel() <= 1) {
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

        if (metadata === undefined) {
          log.info(
            `Block ${block.hash} at level ${currentLevel} has no metadata, skipping`
          );
          currentLevel++;
          continue;
        }

        if (metadata.level_info === undefined) {
          log.info(
            `Metadata for block ${block.hash} at level ${currentLevel} has no level info, skipping`
          );
          currentLevel++;
          continue;
        }

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
            });
            break;
          case "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A":
            events = await protocolI({
              bakers,
              block,
              rpc: rpc,
            });
            break;
          case "PtJakart2xVj7pYXJBXrqHgd82rdkLey5ZeeGwDgPp9rhQUbSqY":
            events = await protocolJ({
              bakers,
              block,
              rpc: rpc,
            });
            break;

          case "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg":
            events = await protocolK({
              bakers,
              block,
              rpc: rpc,
            });
            break;

          case "PtLimaPtLMwfNinJi9rCfDPWea8dFgTZ1MeJ9f1m2SRic6ayiwW":
            events = await protocolL({
              bakers,
              block,
              rpc: rpc,
            });
            break;

          case "PtMumbai2TmsJHNGRkD8v8YDbtao7BLUC3wjASn1inAKLFCjaH1":
            events = await protocolM({
              bakers,
              block,
              rpc: rpc,
            });
            break;

          default:
            console.warn(`Unknown protocol at level ${blockLevel}`);
            events = [];
        }

        const bakerHealthEvents: BakerHealthEvent[] = [];

        for (const { event, baker, newCount } of checkHealth(
          events,
          missedEventsThreshold,
          missedCounts
        )) {
          if (event) {
            bakerHealthEvents.push({
              kind: event,
              baker,
              createdAt: new Date(),
              level: blockLevel,
              cycle: blockCycle,
              timestamp: new Date(block.header.timestamp),
            });
          }
          missedCounts.set(baker, newCount);
        }

        if (!lastBlockCycle || blockCycle > lastBlockCycle) {
          for (const baker of bakers) {
            try {
              const delegateInfo = await rpc.getDelegate(baker);
              const deactivationEvent = checkForDeactivations({
                baker,
                cycle: blockCycle,
                delegateInfo,
                threshold: atRiskThreshold,
              });
              if (deactivationEvent) events.push(deactivationEvent);
            } catch (err) {
              if (err instanceof HttpResponseError) {
                if (
                  err.nodeErrors.some((x) =>
                    x.id.endsWith("delegate.not_registered")
                  )
                ) {
                  log.error(`Delegate ${baker} is not registered`);
                }
              } else {
                log.error(err);
              }
            }
          }
        } else {
          log.debug(
            `Not checking deactivations as this cycle (${blockCycle}) was already checked`
          );
        }

        log.debug(
          `About to post ${events.length} baking events`,
          format.aggregateByBaker(events)
        );
        for (const event of events) {
          await onEvent(event);
          if (
            "level" in event &&
            enableHistory &&
            event.kind !== Events.BakerRecovered &&
            event.kind !== Events.BakerUnhealthy
          ) {
            await addToHistory(event);
          }
        }
        log.debug(
          `About to post ${bakerHealthEvents.length} baker health events`,
          format.aggregateByBaker(bakerHealthEvents)
        );
        for (const event of bakerHealthEvents) {
          await onEvent(event);
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
  for (const baker of bakers) {
    const bakerEventLog = await getBakerEventLog(baker);
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
      atRiskThreshold,
    };
  };

  return {
    name: srv.name,
    start: srv.start,
    stop: srv.stop,
    info,
  };
};

type CheckForDeactivationsArgs = {
  baker: string;
  cycle: number;
  delegateInfo: Delegate;
  threshold: number;
};

export const checkForDeactivations = ({
  baker,
  cycle,
  delegateInfo,
  threshold,
}: CheckForDeactivationsArgs): Deactivated | DeactivationRisk | null => {
  const log = getLogger(name);
  const createdAt = now();
  if (delegateInfo.deactivated) {
    log.debug(`Baker ${baker} is deactivated (on or before cycle ${cycle})`);
    return {
      kind: Events.Deactivated,
      baker,
      cycle,
      createdAt,
    };
  } else if (delegateInfo.grace_period - cycle <= threshold) {
    log.debug(
      `Baker ${baker} is scheduled for deactivation in cycle ${delegateInfo.grace_period}`
    );
    return {
      kind: Events.DeactivationRisk,
      baker,
      cycle: delegateInfo.grace_period,
      createdAt,
    };
  } else {
    const message = `Baker ${baker} is not at risk of deactivation`;
    log.debug(message);
  }

  return null;
};

export type CheckHealthResult = {
  event: Events.BakerUnhealthy | Events.BakerRecovered | undefined;
  baker: TzAddress;
  newCount: number;
};

export function* checkHealth(
  events: BakerEvent[],
  missedEventsThreshold: number,
  missedCounts: Map<TzAddress, number>
): Generator<CheckHealthResult> {
  for (const { baker, kind } of events) {
    const count = missedCounts.get(baker) || 0;
    if (missedKinds.has(kind)) {
      const newCount = count + 1;
      yield {
        event:
          newCount === missedEventsThreshold
            ? Events.BakerUnhealthy
            : undefined,
        baker,
        newCount,
      };
    } else if (successKinds.has(kind) && count > 0) {
      yield {
        event:
          count >= missedEventsThreshold ? Events.BakerRecovered : undefined,
        baker,
        newCount: 0,
      };
    }
  }
}
