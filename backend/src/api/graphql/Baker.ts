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
    t.nonNull.string("chainId");
    t.nonNull.int("level");
    t.nonNull.int("proto");
    t.nonNull.string("protocol");
    t.nonNull.string("timestamp");
  },
});

export const Baker = objectType({
  name: "Baker",

  definition(t) {
    t.nonNull.string("address");
    t.nonNull.list.field("recentEvents", { type: nonNull(LevelEvents) });
    t.nonNull.field("balance", {
      type: nonNull("String"),
      async resolve(parent, _args, ctx) {
        return ctx.rpc.getBalance(parent.address);
      },
    });
    t.nonNull.field("frozenBalance", {
      type: nonNull("String"),
      async resolve(parent, _args, ctx) {
        return ctx.rpc.getFrozenBalance(parent.address);
      },
    });

    t.nonNull.field("stakingBalance", {
      type: nonNull("String"),
      async resolve(parent, _args, ctx) {
        return ctx.rpc.getStakingBalance(parent.address);
      },
    });

    t.nonNull.field("gracePeriod", {
      type: nonNull("Int"),
      async resolve(parent, _args, ctx) {
        return ctx.rpc.getGracePeriod(parent.address);
      },
    });

    t.nonNull.field("deactivated", {
      type: nonNull("Boolean"),
      async resolve(parent, _args, ctx) {
        return ctx.rpc.getDeactivated(parent.address);
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
        const bakerInfos = await ctx.bakerInfoCollection.info();

        return bakerInfos.map((bakerInfo) => {
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
            updatedAt: new Date().toISOString(),
          };
        });
      },
    });

    t.nonNull.field("networkInfo", {
      type: nonNull(NetworkInfo),

      async resolve(_root, _args, ctx) {
        const {
          chain_id: chainId,
          level,
          proto,
          protocol,
          timestamp,
        } = await ctx.rpc.getBlockHeader();
        return { chainId, level, proto, protocol, timestamp };
      },
    });
  },
});
