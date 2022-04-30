import { extendType, objectType } from "nexus";

export const Settings = objectType({
  name: "Settings",
  definition(t) {
    t.nonNull.boolean("showSystemInfo");
  },
});

export const SettingsQuery = extendType({
  type: "Query",

  definition(t) {
    t.nonNull.field("settings", {
      type: Settings,

      async resolve(_, _args, ctx) {
        return {
          showSystemInfo: ctx.showSystemInfo || false,
        };
      },
    });
  },
});
