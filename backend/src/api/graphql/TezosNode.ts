import { objectType } from "nexus";
import { extendType } from "nexus";
import { nonNull } from "nexus";

import { NodeCommunicationError } from "../../nodeMonitor";
import { TezosVersion } from "../../rpc";

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

export const VersionInfo = objectType({
  name: "TezosVersion",

  definition(t) {
    t.nonNull.string("version");
    t.nonNull.string("commitHash");
    t.nonNull.string("chainName");
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
    t.nonNull.field("tezosVersion", { type: nonNull(VersionInfo) });
    t.string("error");
    t.boolean("unableToReach");
    t.nonNull.string("updatedAt");
  },
});

const fmtVersion = (v: TezosVersion | undefined): string => {
  if (!v) return "";
  const { additional_info, major, minor } = v.version;
  const out = `${major}.${minor}`;
  if (!additional_info) return out;
  if (additional_info === "dev") return out + "-dev";
  if (additional_info === "release") return out;
  if (additional_info.rc !== undefined) return out + `-rc${additional_info.rc}`;
  return out;
};

const fmtError = (e: NodeCommunicationError | undefined): string => {
  if (!e) return "";
  return e.message;
};

export const TezosNodeQuery = extendType({
  type: "Query",

  definition(t) {
    t.nonNull.list.field("nodes", {
      type: nonNull(TezosNode),

      async resolve(_root, _args, ctx) {
        const info = await ctx.nodeInfoCollection.info();
        return info.map(
          ({
            url,
            history: recentBlocks,
            bootstrappedStatus,
            peerCount,
            tezosVersion,
            error,
            unableToReach,
            updatedAt,
          }) => {
            return {
              url,
              recentBlocks,
              bootstrapped: bootstrappedStatus?.bootstrapped,
              synced: bootstrappedStatus?.sync_state,
              peerCount: peerCount,
              error: fmtError(error),
              unableToReach,
              tezosVersion: {
                version: fmtVersion(tezosVersion),
                commitHash: tezosVersion?.commit_info.commit_hash || "",
                chainName: tezosVersion?.network_version.chain_name || "",
              },
              updatedAt: updatedAt.toISOString(),
            };
          }
        );
      },
    });
  },
});
