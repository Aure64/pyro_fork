import { objectType } from "nexus";
import { extendType } from "nexus";
import { nonNull } from "nexus";

import { RpcClient, DelegatesResponse } from "@taquito/rpc";

export const BakerEvent = objectType({
  name: "BakerEvent",

  definition(t) {
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
    t.nonNull.string("delegatedBalance");
    t.nonNull.int("gracePeriod");
    t.nonNull.boolean("deactivated");
    t.nonNull.string("updatedAt");
  },
});

const getDelegateInfo = async (
  rpc: RpcClient,
  address: string
): Promise<[string, DelegatesResponse]> => {
  return [address, await rpc.getDelegates(address)];
};

export const BakerQuery = extendType({
  type: "Query",

  definition(t) {
    t.nonNull.list.field("bakers", {
      type: nonNull(Baker),

      async resolve(_root, _args, ctx) {
        const bakerInfo = ctx.bakerInfoCollection.info();
        const bakers = bakerInfo.map((x) => x.address);
        const delegates = await Promise.all(
          bakers.map((address) => getDelegateInfo(ctx.rpc, address))
        );
        return delegates.map(([address, delegate]) => {
          return {
            address: address,
            balance: delegate.balance.toJSON(),
            frozenBalance: delegate.frozen_balance.toJSON(),
            stakingBalance: delegate.staking_balance.toJSON(),
            delegatedBalance: delegate.delegated_balance.toJSON(),
            gracePeriod: delegate.grace_period,
            deactivated: delegate.deactivated,
            recentEvents: [],
            updatedAt: new Date().toISOString(),
          };
        });
      },
    });
  },
});
