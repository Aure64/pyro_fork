import { first, groupBy, orderBy, take } from "lodash";
import {
  extendType,
  nonNull,
  objectType,
  list,
  intArg,
  stringArg,
} from "nexus";
import { Context } from "../context";

import { LRUCache } from "lru-cache";
import { RpcClient } from "../../rpc/client";
import { GraphQLError } from "graphql";

const mkExplorerUrl = (ctx: Context, thing: string) =>
  ctx.explorerUrl ? `${ctx.explorerUrl}/${thing}` : null;

export const BakerEvent = objectType({
  name: "BakerEvent",

  definition(t) {
    t.nonNull.string("kind");
    t.int("priority");
    t.int("slotCount");
  },
});

export const LevelEvents = objectType({
  name: "LevelEvents",

  definition(t) {
    t.nonNull.int("level");
    t.string("explorerUrl");
    t.nonNull.int("cycle");
    t.nonNull.string("timestamp");
    t.nonNull.list.field("events", { type: nonNull(BakerEvent) });
  },
});

export const NetworkInfo = objectType({
  name: "NetworkInfo",

  definition(t) {
    t.nonNull.field("chainName", {
      type: nonNull("String"),
      async resolve(_parent, _args, ctx) {
        const tzVersion = await ctx.rpc.getTezosVersion();
        return tzVersion.network_version.chain_name as string;
      },
    });
    t.nonNull.int("level");
    t.nonNull.int("cycle");
    t.nonNull.string("protocol");
    t.nonNull.int("cyclePosition");
    t.nonNull.int("blocksPerCycle");
  },
});

export const LastProcessed = objectType({
  name: "LastProcessed",

  definition(t) {
    t.nonNull.int("level");
    t.nonNull.int("cycle");
    t.nonNull.int("cyclePosition");
  },
});

export const Participation = objectType({
  name: "Participation",
  definition(t) {
    t.nonNull.int("expected_cycle_activity");
    t.nonNull.int("minimal_cycle_activity");
    t.nonNull.int("missed_slots");
    t.nonNull.int("missed_levels");
    t.nonNull.int("remaining_allowed_missed_slots");
    t.nonNull.string("expected_endorsing_rewards");
  },
});

export const PendingConsensusKey = objectType({
  name: "PendingConsensusKey",
  definition(t) {
    t.nonNull.string("pkh");
    t.nonNull.int("cycle");
  },
});

export const ConsensusKey = objectType({
  name: "ConsensusKey",
  definition(t) {
    t.nonNull.string("active");
    t.string("explorerUrl");
    t.list.field("pendings", { type: nonNull(PendingConsensusKey) });
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const bakerCache = new LRUCache<string, any>({ max: 100 });

const mkGQLError = (originalError: Error) => {
  return new GraphQLError(originalError.message, {
    extensions: { code: "TEZOS_RPC_ERROR", error: originalError },
  });
};

const getGracePeriod = async (
  rpc: RpcClient,
  cycle: number,
  level: number,
  address: string,
  atRiskThreshold: number
): Promise<number> => {
  const cacheKey = `${cycle}:${address}:gracePeriod`;
  let value = bakerCache.get(cacheKey);
  if (!value) {
    try {
      value = await rpc.getGracePeriod(address, `${level}`);
      const atRisk = value - cycle <= atRiskThreshold;
      //baker's grace period end is updated at first endorsement
      //so "at risk" bakers may stop being at risk during the cycle
      //so shouldn't be cached
      if (!atRisk) {
        bakerCache.set(cacheKey, value);
      }
    } catch (err) {
      throw mkGQLError(err as Error);
    }
  }
  return value;
};

export const Baker = objectType({
  name: "Baker",

  definition(t) {
    t.nonNull.string("address");
    t.string("alias");
    t.string("explorerUrl");
    t.field("lastProcessed", { type: LastProcessed });
    t.nonNull.int("headDistance");
    t.nonNull.int("blocksPerCycle");
    t.nonNull.int("atRiskThreshold");
    t.nonNull.list.field("recentEvents", { type: nonNull(LevelEvents) });
    t.field("balance", {
      type: "String",
      async resolve(parent, _args, ctx) {
        if (!parent.lastProcessed) return null;
        try {
          return await ctx.rpc.getFullBalance(
            parent.address,
            `head~${parent.headDistance}`
          );
        } catch (err) {
          throw mkGQLError(err as Error);
        }
      },
    });
    t.field("frozenBalance", {
      type: "String",
      async resolve(parent, _args, ctx) {
        if (!parent.lastProcessed) return null;
        try {
          return await ctx.rpc.getFrozenDeposits(
            parent.address,
            `head~${parent.headDistance}`
          );
        } catch (err) {
          throw mkGQLError(err as Error);
        }
      },
    });

    t.field("stakingBalance", {
      type: "String",
      async resolve(parent, _args, ctx) {
        if (!parent.lastProcessed) return null;
        try {
          return await ctx.rpc.getStakingBalance(
            parent.address,
            `head~${parent.headDistance}`
          );
        } catch (err) {
          throw mkGQLError(err as Error);
        }
      },
    });

    t.field("gracePeriod", {
      type: "Int",
      async resolve(parent, _args, ctx) {
        if (!parent.lastProcessed) return null;
        // return 0;
        const { cycle, level } = parent.lastProcessed;
        const { address } = parent;
        return await getGracePeriod(
          ctx.rpc,
          cycle,
          level,
          address,
          parent.atRiskThreshold
        );
      },
    });

    t.field("consensusKey", {
      type: ConsensusKey,
      async resolve(parent, _args, ctx) {
        if (!parent.lastProcessed) return null;

        const { cycle, level } = parent.lastProcessed;
        const protocol = await getProtocol(cycle, level, ctx);
        if (protocol.startsWith("PtKathman")) {
          return null;
        }

        try {
          const consensusKey = await ctx.rpc.getConsensusKey(
            parent.address,
            `head~${parent.headDistance}`
          );
          if (!consensusKey) return null;

          return {
            ...consensusKey,
            explorerUrl: mkExplorerUrl(ctx, consensusKey.active),
          };
        } catch (err) {
          throw mkGQLError(err as Error);
        }
      },
    });

    t.field("atRisk", {
      type: "Boolean",

      async resolve(parent, _args, ctx) {
        if (!parent.lastProcessed) return null;
        const { cycle, level } = parent.lastProcessed;
        const { address } = parent;
        const gracePeriod = await getGracePeriod(
          ctx.rpc,
          cycle,
          level,
          address,
          parent.atRiskThreshold
        );
        return gracePeriod - cycle <= parent.atRiskThreshold;
      },
    });

    t.field("deactivated", {
      type: "Boolean",
      async resolve(parent, _args, ctx) {
        if (!parent.lastProcessed) return null;
        const { cycle, level } = parent.lastProcessed;
        const { address } = parent;
        const cacheKey = `${cycle}:${address}:deactivated`;
        let value = bakerCache.get(cacheKey);
        if (!value) {
          try {
            value = await ctx.rpc.getDeactivated(address, `${level}`);
            bakerCache.set(cacheKey, value);
          } catch (err) {
            throw mkGQLError(err as Error);
          }
        }
        return value;
      },
    });

    t.field("participation", {
      type: Participation,
      async resolve(parent, _args, ctx) {
        if (!parent.lastProcessed) return null;
        const { cycle, level } = parent.lastProcessed;
        const protocol = await getProtocol(cycle, level, ctx);
        if (protocol.startsWith("PtHangz2")) {
          return null;
        }
        try {
          return await ctx.rpc.getParticipation(
            parent.address,
            `head~${parent.headDistance}`
          );
        } catch (err) {
          throw mkGQLError(err as Error);
        }
      },
    });

    t.nonNull.string("updatedAt");
  },
});

export const Bakers = objectType({
  name: "Bakers",
  definition(t) {
    t.nonNull.field("items", { type: list(nonNull(Baker)) });
    t.nonNull.int("totalCount");
  },
});

let cycleProtocol = { cycle: -1, protocol: "" };

const getProtocol = async (cycle: number, level: number, ctx: Context) => {
  let protocol;
  if (cycleProtocol.cycle === cycle) {
    protocol = cycleProtocol.protocol;
  } else {
    protocol = (await ctx.rpc.getBlockHeader(`${level}`)).protocol;
    cycleProtocol = { cycle, protocol };
  }
  return protocol;
};

export const BakerQuery = extendType({
  type: "Query",

  definition(t) {
    t.nonNull.field("bakers", {
      type: Bakers,

      args: {
        offset: nonNull(intArg()),
        limit: nonNull(intArg()),
        bakers: list(nonNull(stringArg())),
      },

      async resolve(_root, { offset, limit, bakers: bakersFilter }, ctx) {
        const bakerMonitorInfo = await ctx.bakerInfoCollection.info();
        const bakerInfo =
          bakersFilter && bakersFilter.length > 0
            ? bakerMonitorInfo.bakerInfo.filter((x) =>
                bakersFilter.includes(x.address)
              )
            : bakerMonitorInfo.bakerInfo;
        if (bakersFilter) {
          const sortWeights: { [key: string]: number } = {};
          for (let i = 0; i < bakersFilter.length; i++) {
            sortWeights[bakersFilter[i]] = i;
          }
          bakerInfo.sort(
            (a, b) => sortWeights[a.address] - sortWeights[b.address]
          );
        }
        const bakers = bakerInfo
          .slice(offset, offset + limit)
          .map(async (bakerInfo) => {
            const grouped = groupBy(await bakerInfo.recentEvents(), "level");
            const recentEvents = Object.entries(grouped).map(
              ([levelStr, events]) => {
                events = orderBy(events, "kind", "desc");
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const firstEvent = first(events)!;
                return {
                  level: parseInt(levelStr),
                  explorerUrl: mkExplorerUrl(ctx, levelStr),
                  cycle: firstEvent.cycle,
                  timestamp: firstEvent.timestamp.toISOString(),
                  events: events.map((e) => {
                    return {
                      kind: e.kind,
                      priority: "priority" in e ? e.priority : null,
                      slotCount: "slotCount" in e ? e.slotCount : null,
                    };
                  }),
                };
              }
            );
            return {
              address: bakerInfo.address,
              blocksPerCycle: bakerMonitorInfo.blocksPerCycle,
              atRiskThreshold: bakerMonitorInfo.atRiskThreshold,
              explorerUrl: mkExplorerUrl(ctx, bakerInfo.address),
              recentEvents: take(orderBy(recentEvents, "level", "desc"), 5),
              lastProcessed: bakerMonitorInfo.lastProcessed,
              headDistance: bakerMonitorInfo.headDistance,
              updatedAt: new Date().toISOString(),
            };
          });

        return { items: bakers, totalCount: bakerInfo.length };
      },
    });

    t.field("networkInfo", {
      type: NetworkInfo,

      async resolve(_root, _args, ctx) {
        const bakerMonitorInfo = await ctx.bakerInfoCollection.info();
        if (!bakerMonitorInfo || !bakerMonitorInfo.lastProcessed) return null;
        const { level, cycle, cyclePosition } = bakerMonitorInfo.lastProcessed;
        const protocol = await getProtocol(cycle, level, ctx);
        return {
          level,
          protocol,
          cycle,
          cyclePosition: typeof cyclePosition === "number" ? cyclePosition : 0,
          blocksPerCycle: bakerMonitorInfo.blocksPerCycle,
        };
      },
    });
  },
});
