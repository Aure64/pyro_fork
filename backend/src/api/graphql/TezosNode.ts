import { objectType } from "nexus";
import { extendType } from "nexus";
import { nonNull } from "nexus";

export const BlockInfo = objectType({
  name: "BlockInfo",

  definition(t) {
    t.nonNull.string("protocol");
    t.nonNull.string("hash");
    t.nonNull.int("level");
    t.nonNull.string("timestamp");
    t.nonNull.int("priority");
  },
});

export const TezosNode = objectType({
  name: "TezosNode",

  definition(t) {
    t.nonNull.string("url");
    t.nonNull.list.field("recentBlocks", { type: nonNull(BlockInfo) });
    t.boolean("bootstrapped");
    t.string("synced");
    t.int("peerCount");
    t.nonNull.string("updatedAt");
  },
});

export const TezosNodeQuery = extendType({
  type: "Query",

  definition(t) {
    t.nonNull.list.field("nodes", {
      type: nonNull(TezosNode),

      resolve(_root, _args, ctx) {
        const info = ctx.nodeInfoCollection.info();
        return info.map((x) => {
          return {
            url: x.url,
            recentBlocks: x.history,
            bootstrapped: x.bootstrappedStatus
              ? x.bootstrappedStatus.bootstrapped
              : null,
            synced: x.bootstrappedStatus
              ? x.bootstrappedStatus.sync_state
              : null,
            peerCount: x.peerCount,
            updatedAt: x.updatedAt.toISOString(),
          };
        });
      },
    });
  },
});
