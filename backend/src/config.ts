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

export const load = async (path: string): Promise<void> => {
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
};

export const save = (): void => {
  trace("Saving config to disk.");
  nconf.save(null);
};

export const getBakers = (): string[] => {
  return nconf.get(BAKER);
};

export const getRpc = (): string => {
  return nconf.get(RPC);
};

export const getNodes = (): string[] => {
  return nconf.get(NODE);
};

export const getLogLevel = (): LogLevelDesc => {
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

export const getChain = (): string => {
  return nconf.get(CHAIN);
};

export const getLastBlockLevel = (): number | undefined => {
  return nconf.get(LAST_BLOCK_LEVEL);
};

export const setLastBlockLevel = (value: number): void => {
  nconf.set(LAST_BLOCK_LEVEL, value);
  save();
};

/**
 * Gets an arbitrary number from the config at `key`.  Do not use this for values that need to be
 * configured via the CLI, as they won't be reported in the CLI help.
 */
export const getNumber = (key: string): number | undefined => {
  return nconf.get(key);
};

/**
 * Sets an arbitrary number to the config at `key`.  Do not use this for values that need to be
 * configured via the CLI, as they won't be reported in the CLI help.
 */
export const setNumber = (key: string, value: number): void => {
  nconf.set(key, value);
  save();
};

export const getExcludedEvents = (): string[] => {
  return nconf.get(EXCLUDED_EVENTS) || [];
};
