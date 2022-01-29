import { first, groupBy, orderBy, take } from "lodash";
import { extendType, nonNull, objectType, list, intArg } from "nexus";

import LRU from "lru-cache";
import { RpcClient } from "../../rpc/client";

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
  },
});

export const LastProcessed = objectType({
  name: "LastProcessed",

  definition(t) {
    t.nonNull.int("level");
    t.nonNull.int("cycle");
  },
});

const bakerCache = new LRU<string, any>({ max: 100 });

const getGracePeriod = async (
  rpc: RpcClient,
  cycle: number,
  level: number,
  address: string
): Promise<number> => {
  const cacheKey = `${cycle}:${address}:gracePeriod`;
  let value = bakerCache.get(cacheKey);
  if (!value) {
    value = await rpc.getGracePeriod(address, `${level}`);
    bakerCache.set(cacheKey, value);
  }
  return value;
};

export const Baker = objectType({
  name: "Baker",

  definition(t) {
    t.nonNull.string("address");
    t.string("explorerUrl");
    t.field("lastProcessed", { type: LastProcessed });
    t.nonNull.int("headDistance");
    t.nonNull.list.field("recentEvents", { type: nonNull(LevelEvents) });
    t.field("balance", {
      type: "String",
      async resolve(parent, _args, ctx) {
        if (!parent.lastProcessed) return null;
        return ctx.rpc.getBalance(
          parent.address,
          `head~${parent.headDistance}`
        );
      },
    });
    t.field("frozenBalance", {
      type: "String",
      async resolve(parent, _args, ctx) {
        if (!parent.lastProcessed) return null;
        return ctx.rpc.getFrozenBalance(
          parent.address,
          `head~${parent.headDistance}`
        );
      },
    });

    t.field("stakingBalance", {
      type: "String",
      async resolve(parent, _args, ctx) {
        if (!parent.lastProcessed) return null;
        return ctx.rpc.getStakingBalance(
          parent.address,
          `head~${parent.headDistance}`
        );
      },
    });

    t.field("gracePeriod", {
      type: "Int",
      async resolve(parent, _args, ctx) {
        if (!parent.lastProcessed) return null;
        const { cycle, level } = parent.lastProcessed;
        const { address } = parent;
        return await getGracePeriod(ctx.rpc, cycle, level, address);
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
          address
        );
        return gracePeriod - cycle <= 1;
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
          value = ctx.rpc.getDeactivated(parent.address, `${level}`);
          bakerCache.set(cacheKey, value);
        }
        return value;
      },
    });

    t.nonNull.string("updatedAt");
  },
});

export const Bakers = objectType({
  name: "Bakers",
  definition(t) {
    t.nonNull.field("items", { type: list(nonNull(Baker)) });
    t.nonNull.field("totalCount", {
      type: "Int",
      async resolve(_root, _args, ctx) {
        const bakerMonitorInfo = await ctx.bakerInfoCollection.info();
        return bakerMonitorInfo.bakerInfo.length;
      },
    });
  },
});

let cycleProtocol = { cycle: -1, protocol: "" };

export const BakerQuery = extendType({
  type: "Query",

  definition(t) {
    t.nonNull.field("bakers", {
      type: Bakers,

      args: {
        offset: nonNull(intArg()),
        limit: nonNull(intArg()),
      },

      async resolve(_root, args, ctx) {
        const bakerMonitorInfo = await ctx.bakerInfoCollection.info();

        const bakers = bakerMonitorInfo.bakerInfo
          .slice(args.offset, args.offset + args.limit)
          .map(async (bakerInfo) => {
            const grouped = groupBy(await bakerInfo.recentEvents(), "level");
            const recentEvents = Object.entries(grouped).map(
              ([levelStr, events]) => {
                events = orderBy(events, "kind", "desc");
                const firstEvent = first(events)!;
                return {
                  level: parseInt(levelStr),
                  explorerUrl: ctx.explorerUrl
                    ? `${ctx.explorerUrl}/${levelStr}`
                    : null,
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
              explorerUrl: ctx.explorerUrl
                ? `${ctx.explorerUrl}/${bakerInfo.address}`
                : null,
              recentEvents: take(orderBy(recentEvents, "level", "desc"), 5),
              lastProcessed: bakerMonitorInfo.lastProcessed,
              headDistance: bakerMonitorInfo.headDistance,
              updatedAt: new Date().toISOString(),
            };
          });

        return { items: bakers };
      },
    });

    t.field("networkInfo", {
      type: NetworkInfo,

      async resolve(_root, _args, ctx) {
        const bakerMonitorInfo = await ctx.bakerInfoCollection.info();
        if (!bakerMonitorInfo || !bakerMonitorInfo.lastProcessed) return null;
        const { level, cycle } = bakerMonitorInfo.lastProcessed;
        let protocol;
        if (cycleProtocol.cycle === cycle) {
          protocol = cycleProtocol.protocol;
        } else {
          protocol = (
            await ctx.rpc.getBlockHeader({
              block: `${level}`,
            })
          ).protocol;
          cycleProtocol = { cycle, protocol };
        }
        return {
          level,
          protocol,
          cycle,
        };
      },
    });
  },
});
