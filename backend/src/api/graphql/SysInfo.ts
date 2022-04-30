import si from "systeminformation";
import { extendType, objectType } from "nexus";

export const CpuData = objectType({
  name: "CpuData",
  definition(t) {
    t.nonNull.int("cores");
    t.nonNull.string("brand");
    t.nonNull.string("model");
    t.nonNull.string("family");
    t.nonNull.string("manufacturer");
  },
});

export const CpuTemperatureData = objectType({
  name: "CpuTemperatureData",
  definition(t) {
    t.nonNull.list.float("cores");
    t.float("main");
    t.float("max");
    t.list.float("socket");
    t.float("chipset");
  },
});

export const CurrentLoadData = objectType({
  name: "CurrentLoadData",
  definition(t) {
    t.nonNull.float("avgLoad");
  },
});

export const MemData = objectType({
  name: "MemData",
  definition(t) {
    t.nonNull.float("total");
    t.nonNull.float("used");
    t.nonNull.float("active");
    t.nonNull.float("swaptotal");
    t.nonNull.float("swapused");
  },
});

export const FsSizeData = objectType({
  name: "FsSizeData",
  definition(t) {
    t.nonNull.float("available");
    t.nonNull.float("used");
    t.nonNull.float("use");
    t.nonNull.string("fs");
    t.nonNull.string("mount");
    t.nonNull.float("size");
    t.nonNull.string("type");
  },
});

export const OsData = objectType({
  name: "OsData",
  definition(t) {
    t.string("arch");
    t.string("build");
    t.string("codename");
    t.string("codepage");
    t.string("distro");
    t.string("fqdn");
    t.string("hostname");
    t.boolean("hypervizor");
    t.string("kernel");
    t.string("platform");
    t.string("release");
    t.string("servicepack");
  },
});

export const SysInfo = objectType({
  name: "SysInfo",
  definition(t) {
    t.nonNull.field("cpu", { type: CpuData });
    t.nonNull.field("cpuTemperature", { type: CpuTemperatureData });
    t.nonNull.field("currentLoad", { type: CurrentLoadData });
    t.nonNull.field("mem", { type: MemData });
    t.nonNull.float("fullLoad");
    t.nonNull.field("inetLatency", {
      type: "Float",
      async resolve() {
        //this is slow
        return await si.inetLatency();
      },
    });
    t.nonNull.list.field("fsSize", {
      type: FsSizeData,
      async resolve() {
        const fsSize = await si.fsSize();
        return fsSize;
      },
    });
    t.nonNull.field("osInfo", {
      type: OsData,
      async resolve() {
        const os = await si.osInfo();
        return os;
      },
    });
  },
});

export const SysInfoQuery = extendType({
  type: "Query",

  definition(t) {
    t.nonNull.field("sysInfo", {
      type: SysInfo,

      async resolve(_, _args, ctx) {
        if (!ctx.showSystemInfo) {
          throw new Error("not enabled");
        }
        const cpu = await si.cpu();
        const cpuTemperature = await si.cpuTemperature();
        const currentLoad = await si.currentLoad();
        const mem = await si.mem();
        const fullLoad = await si.fullLoad();
        return {
          cpu,
          cpuTemperature,
          currentLoad,
          mem,
          fullLoad,
        };
      },
    });
  },
});
