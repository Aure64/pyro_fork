import * as nconf from "nconf";
import { promisify } from "util";
import { LogLevelDesc, debug, warn } from "loglevel";
import { SlackConfig } from "./slackNotificationChannel";
import { TelegramConfig } from "./telegramNotificationChannel";
import { EmailConfig } from "./emailNotificationChannel";
import { DesktopConfig } from "./desktopNotificationChannel";
import { EndpointConfig } from "./endpointNotificationChannel";
import * as FS from "fs";
import * as Path from "path";
import envPaths from "env-paths";
import * as yargs from "yargs";

const SYSTEM_PREFIX = "system"; // prefix before system settings
// system prefs
const LAST_BLOCK_LEVEL = `${SYSTEM_PREFIX}:lastBlockLevel`;

// user prefs
type UserPref = {
  key: string;
  default: unknown;
  description: string;
  type: yargs.PositionalOptionsType | undefined;
  alias: string | undefined;
  group: string | undefined;
  array: boolean;
};
const BAKER: UserPref = {
  key: "baker",
  default: [],
  description: "Node to watch for baking events.",
  alias: "b",
  type: "string",
  group: undefined,
  array: true,
};
const LOGGING: UserPref = {
  key: "logging",
  default: "info",
  description: "Level of logging. [trace, debug, info, warn, error]",
  alias: "l",
  type: "string",
  group: undefined,
  array: false,
};
const NODE: UserPref = {
  key: "node",
  default: [],
  description: "Node URLs to watch for node events.",
  alias: "n",
  type: "string",
  group: undefined,
  array: true,
};
const RPC: UserPref = {
  key: "rpc",
  default: "https://mainnet-tezos.giganode.io/",
  description: "Tezos RPC URL to query for baker and chain info",
  alias: "r",
  type: "string",
  group: undefined,
  array: false,
};
const EXCLUDED_EVENTS: UserPref = {
  key: "filter:omit",
  default: [],
  description: "Events to omit from notifications",
  alias: undefined,
  type: "string",
  group: undefined,
  array: true,
};
const SLACK_URL: UserPref = {
  key: "notifier:slack:url",
  default: undefined,
  description: "Webhook URL for Slack notifications",
  alias: undefined,
  type: "string",
  group: "Slack Notifications:",
  array: false,
};
const TELEGRAM_TOKEN: UserPref = {
  key: "notifier:telegram:token",
  default: undefined,
  description: "API token for Telegram notification channel",
  alias: undefined,
  type: "string",
  group: "Telegram Notifications:",
  array: false,
};
const TELEGRAM_CHAT_ID: UserPref = {
  key: "notifier:telegram:chat",
  default: undefined,
  description: "Bot chat ID for Telegram notification channel",
  alias: undefined,
  type: "string",
  group: "Telegram Notifications:",
  array: false,
};
const EMAIL_HOST: UserPref = {
  key: "notifier:email:host",
  default: undefined,
  description: "Host for email notification channel",
  alias: undefined,
  type: "string",
  group: "Email Notifications:",
  array: false,
};
const EMAIL_PORT: UserPref = {
  key: "notifier:email:port",
  default: undefined,
  description: "Port for email notification channel",
  alias: undefined,
  type: "number",
  group: "Email Notifications:",
  array: false,
};
const EMAIL_PROTOCOL: UserPref = {
  key: "notifier:email:protocol",
  default: undefined,
  description:
    "Protocol for email notification channel [Plain,  SSL,  STARTTLS]",
  alias: undefined,
  type: "string",
  group: "Email Notifications:",
  array: false,
};
const EMAIL_USERNAME: UserPref = {
  key: "notifier:email:username",
  default: undefined,
  description: "Username for email notification channel",
  alias: undefined,
  type: "string",
  group: "Email Notifications:",
  array: false,
};
const EMAIL_PASSWORD: UserPref = {
  key: "notifier:email:password",
  default: undefined,
  description: "Password for email notification channel",
  alias: undefined,
  type: "string",
  group: "Email Notifications:",
  array: false,
};
const EMAIL_EMAIL: UserPref = {
  key: "notifier:email:email",
  default: undefined,
  description: "Address for email notifier channel",
  alias: undefined,
  type: "string",
  group: "Email Notifications:",
  array: false,
};
const DESKTOP_ENABLED: UserPref = {
  key: "notifier:desktop:enabled",
  default: true,
  description: "Whether desktop notifier is enabled",
  alias: undefined,
  type: "boolean",
  group: "Desktop Notifications:",
  array: false,
};
const DESKTOP_SOUND: UserPref = {
  key: "notifier:desktop:sound",
  default: false,
  description: "Whether desktop notifier should use sound",
  alias: undefined,
  type: "boolean",
  group: "Desktop Notifications:",
  array: false,
};
const ENDPOINT_URL: UserPref = {
  key: "notifier:endpoint:url",
  default: undefined,
  description: "URL for posting raw JSON notifications",
  alias: undefined,
  type: "string",
  group: "JSON Notifications:",
  array: false,
};
const CONFIG_FILE: UserPref = {
  key: "config",
  default: undefined,
  description:
    "Path to config file.  If present, it will override the default user config file.",
  alias: undefined,
  type: "string",
  group: undefined,
  array: false,
};

// list of all prefs that should be iterated to build yargs options and nconf defaults
const userPrefs = [
  BAKER,
  LOGGING,
  NODE,
  RPC,
  EXCLUDED_EVENTS,
  SLACK_URL,
  TELEGRAM_TOKEN,
  TELEGRAM_CHAT_ID,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_PROTOCOL,
  EMAIL_EMAIL,
  EMAIL_USERNAME,
  EMAIL_PASSWORD,
  DESKTOP_ENABLED,
  DESKTOP_SOUND,
  ENDPOINT_URL,
  CONFIG_FILE,
];

export type Config = {
  save: () => void;
  getBakers: GetBakers;
  getRpc: GetRpc;
  getNodes: GetNodes;
  getLogLevel: GetLogLevel;
  getLastBlockLevel: GetLastBlockLevel;
  setLastBlockLevel: SetLastBlockLevel;
  getNumber: GetNumber;
  setNumber: SetNumber;
  getExcludedEvents: GetExcludedEvents;
  getSlackConfig: GetSlackConfig;
  getTelegramConfig: GetTelegramConfig;
  getEmailConfig: GetEmailConfig;
  getDesktopConfig: GetDesktopConfig;
  getEndpointConfig: GetEndpointConfig;
  getStorageDirectory: GetStorageDirectory;
};

const makeYargOptions = () => {
  const options = userPrefs.reduce(
    (accumulator: { [key: string]: yargs.Options }, pref: UserPref) => {
      const defaultDescription = pref.default ? `${pref.default}` : undefined;
      accumulator[pref.key] = {
        type: pref.type,
        alias: pref.alias,
        description: pref.description,
        defaultDescription,
        group: pref.group,
        array: pref.array,
      };
      return accumulator;
    },
    {}
  );
  return options;
};

const makeYargDefaults = () => {
  const defaults = userPrefs.reduce(
    (accumulator: { [key: string]: unknown }, pref: UserPref) => {
      if (pref.default !== undefined) {
        accumulator[pref.key] = pref.default;
      }
      return accumulator;
    },
    {}
  );
  return defaults;
};

const userConfigPath = (path: string) => Path.join(path, "config.json");
const systemConfigPath = (path: string) => Path.join(path, "system.json");

export const load = async (): Promise<Config> => {
  const { data: dataDirectory, config: configDirectory } = envPaths(
    "kiln-next"
  );
  if (!FS.existsSync(dataDirectory)) {
    console.log(`Creating data directory: ${dataDirectory}`);
    FS.mkdirSync(dataDirectory, { recursive: true });
  } else {
    console.log(`Data directory: ${dataDirectory}`);
  }
  if (!FS.existsSync(configDirectory)) {
    console.log(`Creating config directory: ${configDirectory}`);
    FS.mkdirSync(configDirectory, { recursive: true });
  } else {
    console.log(`Config directory: ${configDirectory}`);
  }
  nconf.argv(
    yargs
      .strict()
      .options(makeYargOptions())
      .alias("help", "h")
      .alias("version", "v")
  );
  // user config file from argv overrides default location
  const configPath =
    nconf.get(CONFIG_FILE.key) || userConfigPath(configDirectory);
  nconf.file("user", configPath);
  nconf.file("system", systemConfigPath(configDirectory));
  nconf.defaults(makeYargDefaults());

  const loadAsync = promisify(nconf.load.bind(nconf));
  await loadAsync().then(console.log);
  const config: Config = {
    save: () => save(configDirectory),
    getBakers,
    getRpc,
    getNodes,
    getLogLevel,
    getLastBlockLevel,
    setLastBlockLevel,
    getNumber,
    setNumber,
    getExcludedEvents,
    getSlackConfig,
    getTelegramConfig,
    getEmailConfig,
    getDesktopConfig,
    getEndpointConfig,
    getStorageDirectory: () => dataDirectory,
  };
  return config;
};

const save = (path: string): void => {
  // read in system config.  Kiln currently doesn't update user settings
  const { [SYSTEM_PREFIX]: systemSettings } = nconf.get();
  debug("Saving config to disk.");
  // save system config
  if (systemSettings) {
    FS.writeFileSync(systemConfigPath(path), JSON.stringify(systemSettings));
  }
};

type GetBakers = () => string[];

const getBakers: GetBakers = () => {
  return nconf.get(BAKER.key);
};

type GetRpc = () => string;

const getRpc: GetRpc = () => {
  return nconf.get(RPC.key);
};

type GetNodes = () => string[];
const getNodes: GetNodes = () => {
  return nconf.get(NODE.key);
};

type GetLogLevel = () => LogLevelDesc;

const getLogLevel: GetLogLevel = () => {
  const value = nconf.get(LOGGING.key);
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

type GetLastBlockLevel = () => number | undefined;

const getLastBlockLevel: GetLastBlockLevel = () => {
  return nconf.get(LAST_BLOCK_LEVEL);
};

type SetLastBlockLevel = (value: number) => void;

const setLastBlockLevel: SetLastBlockLevel = (value) => {
  nconf.set(LAST_BLOCK_LEVEL, value);
};

type GetNumber = (key: string) => number | undefined;

/**
 * Gets an arbitrary number from the system config at `key`.  Do not use this for values that need to be
 * configured via the CLI, as they won't be reported in the CLI help.
 */
const getNumber: GetNumber = (key) => {
  return nconf.get(`${SYSTEM_PREFIX}:${key}`);
};

type SetNumber = (key: string, value: number) => void;
/**
 * Sets an arbitrary number to the system config at `key`.  Do not use this for values that need to be
 * configured via the CLI, as they won't be reported in the CLI help.
 */
const setNumber: SetNumber = (key, value) => {
  nconf.set(`${SYSTEM_PREFIX}:${key}`, value);
};

type GetExcludedEvents = () => string[];

const getExcludedEvents: GetExcludedEvents = () => {
  return nconf.get(EXCLUDED_EVENTS.key) || [];
};

type GetSlackConfig = () => SlackConfig | undefined;

const getSlackConfig: GetSlackConfig = () => {
  const url = nconf.get(SLACK_URL.key);
  if (url) return { url };
  return undefined;
};

type GetTelegramConfig = () => TelegramConfig | undefined;

const getTelegramConfig: GetTelegramConfig = () => {
  const token = nconf.get(TELEGRAM_TOKEN.key);
  const chatId = nconf.get(TELEGRAM_CHAT_ID.key);
  if (token && chatId !== undefined) return { token, chatId };
  return undefined;
};

type GetEmailConfig = () => EmailConfig | undefined;

const getEmailConfig: GetEmailConfig = () => {
  const host = nconf.get(EMAIL_HOST.key);
  const port = nconf.get(EMAIL_PORT.key);
  const protocol = nconf.get(EMAIL_PROTOCOL.key);
  const username = nconf.get(EMAIL_USERNAME.key);
  const password = nconf.get(EMAIL_PASSWORD.key);
  const email = nconf.get(EMAIL_EMAIL.key);
  if (host && port && protocol && email)
    return { host, port, protocol, username, password, email };
  return undefined;
};

type GetDesktopConfig = () => DesktopConfig;

const getDesktopConfig: GetDesktopConfig = () => {
  const enableSound = nconf.get(DESKTOP_SOUND.key);
  const enabled = nconf.get(DESKTOP_ENABLED.key);
  return { enabled, enableSound };
};

type GetEndpointConfig = () => EndpointConfig | undefined;

const getEndpointConfig: GetEndpointConfig = () => {
  const url = nconf.get(ENDPOINT_URL.key);
  if (url) return { url };
  return undefined;
};

type GetStorageDirectory = () => string;
