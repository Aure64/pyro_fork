import { first, groupBy, orderBy, take } from "lodash";
import { extendType, nonNull, objectType } from "nexus";

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
        return tzVersion.network_version.chain_name;
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

export const Baker = objectType({
  name: "Baker",

  definition(t) {
    t.nonNull.string("address");
    t.field("lastProcessed", { type: LastProcessed });
    t.nonNull.list.field("recentEvents", { type: nonNull(LevelEvents) });
    t.field("balance", {
      type: "String",
      async resolve(parent, _args, ctx) {
        if (!parent.lastProcessed) return null;
        return ctx.rpc.getBalance(
          parent.address,
          `${parent.lastProcessed.level}`
        );
      },
    });
    t.field("frozenBalance", {
      type: "String",
      async resolve(parent, _args, ctx) {
        if (!parent.lastProcessed) return null;
        return ctx.rpc.getFrozenBalance(
          parent.address,
          `${parent.lastProcessed.level}`
        );
      },
    });

    t.field("stakingBalance", {
      type: "String",
      async resolve(parent, _args, ctx) {
        if (!parent.lastProcessed) return null;
        return ctx.rpc.getStakingBalance(
          parent.address,
          `${parent.lastProcessed.level}`
        );
      },
    });

    t.field("gracePeriod", {
      type: "Int",
      async resolve(parent, _args, ctx) {
        if (!parent.lastProcessed) return null;
        return ctx.rpc.getGracePeriod(
          parent.address,
          `${parent.lastProcessed.level}`
        );
      },
    });

    t.field("atRisk", {
      type: "Boolean",

      async resolve(parent, _args, ctx) {
        if (!parent.lastProcessed) return null;
        const gracePeriod = await ctx.rpc.getGracePeriod(
          parent.address,
          `${parent.lastProcessed.level}`
        );
        return gracePeriod - parent.lastProcessed.cycle <= 1;
      },
    });

    t.field("deactivated", {
      type: "Boolean",
      async resolve(parent, _args, ctx) {
        if (!parent.lastProcessed) return null;
        return ctx.rpc.getDeactivated(
          parent.address,
          `${parent.lastProcessed.level}`
        );
      },
    });

    t.nonNull.string("updatedAt");
  },
});

export const BakerQuery = extendType({
  type: "Query",

  definition(t) {
    t.nonNull.list.field("bakers", {
      type: nonNull(Baker),

      async resolve(_root, _args, ctx) {
        const bakerMonitorInfo = await ctx.bakerInfoCollection.info();

        return bakerMonitorInfo.bakerInfo.map((bakerInfo) => {
          const recentEvents = Object.entries(
            groupBy(bakerInfo.recentEvents, "level")
          ).map(([levelStr, events]) => {
            const firstEvent = first(events)!;
            return {
              level: parseInt(levelStr),
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
          });

          return {
            address: bakerInfo.address,
            recentEvents: take(orderBy(recentEvents, "level", "desc"), 5),
            lastProcessed: bakerMonitorInfo.lastProcessed,
            updatedAt: new Date().toISOString(),
          };
        });
      },
    });

    t.field("networkInfo", {
      type: NetworkInfo,

      async resolve(_root, _args, ctx) {
        const bakerMonitorInfo = await ctx.bakerInfoCollection.info();
        if (!bakerMonitorInfo || !bakerMonitorInfo.lastProcessed) return null;
        const { level, cycle } = bakerMonitorInfo.lastProcessed;
        const { protocol } = await ctx.rpc.getBlockHeader({
          block: `${level}`,
        });
        return {
          level,
          protocol,
          cycle,
        };
      },
    });
  },
});
