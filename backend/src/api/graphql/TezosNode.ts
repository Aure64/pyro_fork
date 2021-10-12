import { objectType } from "nexus";
import { extendType } from "nexus";
import { nonNull } from "nexus";

export const TezosNode = objectType({
  name: "TezosNode",

  definition(t) {
    t.nonNull.string("url");
    t.nonNull.string("head");
    t.nonNull.int("level");
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
            head: x.head,
            level: x.history[0].level,
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
