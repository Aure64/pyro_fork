import { extendType, objectType } from "nexus";

export const Settings = objectType({
  name: "Settings",
  definition(t) {
    t.nonNull.boolean("showPyrometerInfo");
  },
});

export const SettingsQuery = extendType({
  type: "Query",

  definition(t) {
    t.nonNull.field("settings", {
      type: Settings,

      async resolve(_, _args, ctx) {
        return {
          showPyrometerInfo: ctx.showPyrometerInfo || false,
        };
      },
    });
  },
});
