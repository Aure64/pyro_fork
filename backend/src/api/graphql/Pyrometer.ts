import process from "process";
import si from "systeminformation";
import { extendType, objectType } from "nexus";

export const CpuUsage = objectType({
  name: "CpuUsage",
  definition(t) {
    t.float("user");
    t.float("system");
  },
});

export const ProcessData = objectType({
  name: "ProcessInfo",
  definition(t) {
    t.nonNull.float("cpu");
    t.nonNull.float("mem");
    t.nonNull.float("memRss");
    t.nonNull.float("memVsz");
    t.nonNull.int("pid");
    t.nonNull.string("started");
  },
});

export const PyrometerInfo = objectType({
  name: "PyrometerInfo",
  definition(t) {
    t.nonNull.field("version", {
      type: "String",
      async resolve() {
        return process.env.npm_package_version || "";
      },
    });

    t.field("process", {
      type: ProcessData,
      async resolve() {
        const processes = await si.processes();
        const info = processes.list.find((x) => x.pid == process.pid);
        if (info) {
          return { ...info, started: info.started.replace(" ", "T") };
        }
        return null;
      },
    });
  },
});

export const PyrometerInfoQuery = extendType({
  type: "Query",

  definition(t) {
    t.nonNull.field("pyrometer", {
      type: PyrometerInfo,
      async resolve(_, _args, ctx) {
        if (!ctx.showPyrometerInfo) {
          throw new Error("not enabled");
        }
        return {};
      },
    });
  },
});
