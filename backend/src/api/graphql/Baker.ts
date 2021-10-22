import { DelegatesResponse, RpcClient } from "@taquito/rpc";
import { groupBy, orderBy, take, first } from "lodash";
import { extendType, nonNull, objectType } from "nexus";
import { BakerInfo } from "../../bakerMonitor";

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

export const Baker = objectType({
  name: "Baker",

  definition(t) {
    t.nonNull.string("address");
    t.nonNull.list.field("recentEvents", { type: nonNull(LevelEvents) });
    t.nonNull.string("balance");
    t.nonNull.string("frozenBalance");
    t.nonNull.string("stakingBalance");
    t.nonNull.int("gracePeriod");
    t.nonNull.boolean("deactivated");
    t.nonNull.string("updatedAt");
  },
});

const getDelegateInfo = async (
  rpc: RpcClient,
  bakerInfo: BakerInfo
): Promise<[BakerInfo, DelegatesResponse]> => {
  return [bakerInfo, await rpc.getDelegates(bakerInfo.address)];
};

export const BakerQuery = extendType({
  type: "Query",

  definition(t) {
    t.nonNull.list.field("bakers", {
      type: nonNull(Baker),

      async resolve(_root, _args, ctx) {
        const bakerInfos = await ctx.bakerInfoCollection.info();
        const delegates = await Promise.all(
          bakerInfos.map((bakerInfo) => getDelegateInfo(ctx.rpc, bakerInfo))
        );
        return delegates.map(([bakerInfo, delegate]) => {
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
            balance: delegate.balance.toJSON(),
            frozenBalance: delegate.frozen_balance.toJSON(),
            stakingBalance: delegate.staking_balance.toJSON(),
            delegatedBalance: delegate.delegated_balance.toJSON(),
            gracePeriod: delegate.grace_period,
            deactivated: delegate.deactivated,
            recentEvents: take(orderBy(recentEvents, "level", "desc"), 5),
            updatedAt: new Date().toISOString(),
          };
        });
      },
    });
  },
});
