import { objectType } from "nexus";
import { extendType } from "nexus";
import { nonNull } from "nexus";

export const TezosNode = objectType({
  name: "TezosNode",

  definition(t) {
    t.nonNull.string("url");
    t.nonNull.string("head");
    t.boolean("bootstrapped");
    t.string("synced");
    t.int("peerCount");
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
            bootstrapped: x.bootstrappedStatus
              ? x.bootstrappedStatus.bootstrapped
              : null,
            synced: x.bootstrappedStatus
              ? x.bootstrappedStatus.sync_state
              : null,
            peerCount: x.peerCount,
          };
        });
      },
    });
  },
});
