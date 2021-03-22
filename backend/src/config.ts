import * as nconf from "nconf";
import { promisify } from "util";
import { LogLevelDesc, trace, warn } from "loglevel";

const BAKER = "baker";
const LOGGING = "logging";
const NODE = "node";
const RPC = "rpc";
const CHAIN = "chain";
const LAST_BLOCK_LEVEL = "lastBlockLevel";
const EXCLUDED_EVENTS = "filter:omit";

export type Config = {
  save: () => Promise<void>;
  getBakers: GetBakers;
  getRpc: GetRpc;
  getNodes: GetNodes;
  getLogLevel: GetLogLevel;
  getChain: GetChain;
  getLastBlockLevel: GetLastBlockLevel;
  setLastBlockLevel: SetLastBlockLevel;
  getNumber: GetNumber;
  setNumber: SetNumber;
  getExcludedEvents: GetExcludedEvents;
};

export const load = async (path: string): Promise<Config> => {
  nconf
    .argv({
      [BAKER]: {
        describe: "Node to watch for baking events.",
        parseValues: true,
        type: "array",
      },
      [NODE]: {
        describe: "Node URLs to watch for node events.",
        parseValues: true,
        type: "array",
      },
      [RPC]: {
        describe: "Tezos RPC URL to query for baker and chain info",
        parseValues: true,
        type: "string",
      },
      [LOGGING]: {
        describe: "Level of logging. [trace, debug, info, warn, error]",
        parseValues: true,
        type: "string",
      },
      [CHAIN]: {
        describe: "Chain to monitor and query against",
        parseValues: true,
        type: "string",
      },
      [EXCLUDED_EVENTS]: {
        describe: "Events to omit from notifications",
        parseValues: true,
        type: "array",
      },
    })
    .file(path)
    .defaults({
      [BAKER]: [],
      [NODE]: [],
      [CHAIN]: "main",
      [RPC]: "https://mainnet-tezos.giganode.io/",
      [LOGGING]: "info",
      [EXCLUDED_EVENTS]: [],
    });
  const loadAsync = promisify(nconf.load.bind(nconf));
  await loadAsync().then(console.log);
  const config: Config = {
    save,
    getBakers,
    getRpc,
    getNodes,
    getLogLevel,
    getChain,
    getLastBlockLevel,
    setLastBlockLevel,
    getNumber,
    setNumber,
    getExcludedEvents,
  };
  return config;
};

export const save = async (): Promise<void> => {
  trace("Saving config to disk.");
  // save doesn't confirm to standard node callbacks, so we can't use promisify on it
  return new Promise((resolve) => {
    nconf.save(null, () => {
      resolve();
    });
  });
};

type GetBakers = () => string[];

const getBakers: GetBakers = () => {
  return nconf.get(BAKER);
};

type GetRpc = () => string;

const getRpc: GetRpc = () => {
  return nconf.get(RPC);
};

type GetNodes = () => string[];
const getNodes: GetNodes = () => {
  return nconf.get(NODE);
};

type GetLogLevel = () => LogLevelDesc;

const getLogLevel: GetLogLevel = () => {
  const value = nconf.get(LOGGING);
  return logLevelFromString(value);
};

const logLevels: LogLevelDesc[] = ["trace", "info", "debug", "warn", "error"];
const logLevelFromString = (value: string): LogLevelDesc => {
  if (logLevels.includes(value as LogLevelDesc)) {
    return value as LogLevelDesc;
  } else {
    warn("Unknown logging level, using info");
    return "info";
  }
};

type GetChain = () => string;

const getChain: GetChain = () => {
  return nconf.get(CHAIN);
};

type GetLastBlockLevel = () => number | undefined;

const getLastBlockLevel: GetLastBlockLevel = () => {
  return nconf.get(LAST_BLOCK_LEVEL);
};

type SetLastBlockLevel = (value: number) => void;

const setLastBlockLevel: SetLastBlockLevel = (value) => {
  nconf.set(LAST_BLOCK_LEVEL, value);
  save();
};

type GetNumber = (key: string) => number | undefined;

/**
 * Gets an arbitrary number from the config at `key`.  Do not use this for values that need to be
 * configured via the CLI, as they won't be reported in the CLI help.
 */
const getNumber: GetNumber = (key) => {
  return nconf.get(key);
};

type SetNumber = (key: string, value: number) => void;
/**
 * Sets an arbitrary number to the config at `key`.  Do not use this for values that need to be
 * configured via the CLI, as they won't be reported in the CLI help.
 */
const setNumber: SetNumber = (key, value) => {
  nconf.set(key, value);
  save();
};

type GetExcludedEvents = () => string[];

const getExcludedEvents: GetExcludedEvents = () => {
  return nconf.get(EXCLUDED_EVENTS) || [];
};
