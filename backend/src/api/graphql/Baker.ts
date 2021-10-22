import { objectType } from "nexus";
import { extendType } from "nexus";
import { nonNull } from "nexus";

import { RpcClient, DelegatesResponse } from "@taquito/rpc";

import { BakerInfo } from "../../bakerMonitor";

export const BakerEvent = objectType({
  name: "BakerEvent",

  definition(t) {
    t.nonNull.string("kind");
    t.nonNull.int("level");
    t.nonNull.int("cycle");
    t.nonNull.string("timestamp");
  },
});

export const Baker = objectType({
  name: "Baker",

  definition(t) {
    t.nonNull.string("address");
    t.nonNull.list.field("recentEvents", { type: nonNull(BakerEvent) });
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
          const recentEvents = bakerInfo.recentEvents.map((e) => {
            return {
              level: e.level,
              cycle: e.cycle,
              kind: e.kind,
              timestamp: e.timestamp.toISOString(),
            };
          });
          recentEvents.reverse();
          return {
            address: bakerInfo.address,
            balance: delegate.balance.toJSON(),
            frozenBalance: delegate.frozen_balance.toJSON(),
            stakingBalance: delegate.staking_balance.toJSON(),
            delegatedBalance: delegate.delegated_balance.toJSON(),
            gracePeriod: delegate.grace_period,
            deactivated: delegate.deactivated,
            recentEvents,
            updatedAt: new Date().toISOString(),
          };
        });
      },
    });
  },
});
