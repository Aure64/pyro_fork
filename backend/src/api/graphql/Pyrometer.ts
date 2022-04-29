import process from "process";
import si from "systeminformation";
import { extendType, objectType, list, nonNull } from "nexus";

const started = new Date();

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
    t.nonNull.string("command");
    t.nonNull.string("name");
    t.nonNull.string("user");
    t.nonNull.string("params");
    t.nonNull.string("path");
  },
});

type WithCommand = { command: string };

const processDisplayCmp = (x: WithCommand, y: WithCommand) =>
  x.command.localeCompare(y.command);

export const PyrometerInfo = objectType({
  name: "PyrometerInfo",
  definition(t) {
    t.nonNull.field("version", {
      type: "String",
      async resolve() {
        return process.env.npm_package_version || "";
      },
    });

    t.nonNull.field("processes", {
      type: list(nonNull(ProcessData)),
      async resolve() {
        const processes = await si.processes();
        return processes.list
          .filter((x) => x.pid === process.pid || x.command.includes("tezos"))
          .map((x) => {
            const started = new Date(x.started);
            return { ...x, started: started.toISOString() };
          })
          .sort(processDisplayCmp);
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
