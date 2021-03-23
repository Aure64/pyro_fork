import * as nconf from "nconf";
import { promisify } from "util";
import { LogLevelDesc, debug, warn } from "loglevel";
import { SlackConfig } from "./slackNotificationChannel";
import { TelegramConfig } from "./telegramNotificationChannel";
import { EmailConfig } from "./emailNotificationChannel";
import { DesktopConfig } from "./desktopNotificationChannel";
import * as FS from "fs";
import * as Path from "path";

const SYSTEM_PREFIX = "system"; // prefix before system settings
const userConfigName = "config.json";
const systemConfigName = "system.json";

const BAKER = "baker";
const LOGGING = "logging";
const NODE = "node";
const RPC = "rpc";
const CHAIN = "chain";
const LAST_BLOCK_LEVEL = `${SYSTEM_PREFIX}:lastBlockLevel`;
const EXCLUDED_EVENTS = "filter:omit";
const SLACK_URL = "notifier:slack:url";
const TELEGRAM_TOKEN = "notifier:telegram:token";
const TELEGRAM_CHAT_ID = "notifier:telegram:chat";
const EMAIL_HOST = "notifier:email:host";
const EMAIL_PORT = "notifier:email:port";
const EMAIL_PROTOCOL = "notifier:email:protocol";
const EMAIL_USERNAME = "notifier:email:username";
const EMAIL_PASSWORD = "notifier:email:password";
const EMAIL_EMAIL = "notifier:email:email";
const DESKTOP_ENABLED = "notifier:desktop:enabled";
const DESKTOP_SOUND = "notifier:desktop:sound";

export type Config = {
  save: () => void;
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
  getSlackConfig: GetSlackConfig;
  getTelegramConfig: GetTelegramConfig;
  getEmailConfig: GetEmailConfig;
  getDesktopConfig: GetDesktopConfig;
};

const userConfigPath = (path: string) => Path.join(path, userConfigName);
const systemConfigPath = (path: string) => Path.join(path, systemConfigName);

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
      [SLACK_URL]: {
        describe: "Webhook URL for Slack notifications",
        parseValues: true,
        type: "string",
      },
      [TELEGRAM_TOKEN]: {
        describe: "API token for Telegram notification channel",
        parseValues: true,
        type: "string",
      },
      [TELEGRAM_CHAT_ID]: {
        describe: "Bot chat ID for Telegram notification channel",
        parseValues: true,
        type: "number",
      },
      [EMAIL_HOST]: {
        describe: "Host for email notification channel",
        parseValues: true,
        type: "string",
      },
      [EMAIL_PORT]: {
        describe: "Port for email notification channel",
        parseValues: true,
        type: "number",
      },
      [EMAIL_PROTOCOL]: {
        describe:
          "Protocol for email notification channel [Plain,  SSL,  STARTTLS]",
        parseValues: true,
        type: "string",
      },
      [EMAIL_USERNAME]: {
        describe: "Username for email notification channel",
        parseValues: true,
        type: "string",
      },
      [EMAIL_PASSWORD]: {
        describe: "Password for email notification channel",
        parseValues: true,
        type: "string",
      },
      [EMAIL_EMAIL]: {
        describe: "Address for email notifier channel",
        parseValues: true,
        type: "string",
      },
      [DESKTOP_ENABLED]: {
        describe: "Whether desktop notifier is enabled",
        parseValues: true,
        type: "boolean",
        default: true,
      },
      [DESKTOP_SOUND]: {
        describe: "Whether desktop notifier should use sound",
        parseValues: true,
        type: "boolean",
        default: false,
      },
    })
    .file("user", userConfigPath(path))
    .file("system", systemConfigPath(path))
    .defaults({
      [BAKER]: [],
      [NODE]: [],
      [CHAIN]: "main",
      [RPC]: "https://mainnet-tezos.giganode.io/",
      [LOGGING]: "info",
      [EXCLUDED_EVENTS]: [],
      [DESKTOP_ENABLED]: true,
      [DESKTOP_SOUND]: false,
    });
  const loadAsync = promisify(nconf.load.bind(nconf));
  await loadAsync().then(console.log);
  const config: Config = {
    save: () => save(path),
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
    getSlackConfig,
    getTelegramConfig,
    getEmailConfig,
    getDesktopConfig,
  };
  return config;
};

const save = (path: string): void => {
  // read in system config.  Kiln currently doesn't update user settings
  const { [SYSTEM_PREFIX]: systemSettings } = nconf.get();
  debug("Saving config to disk.");
  // save system config
  FS.writeFileSync(systemConfigPath(path), JSON.stringify(systemSettings));
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
  return nconf.get(EXCLUDED_EVENTS) || [];
};

type GetSlackConfig = () => SlackConfig | undefined;

const getSlackConfig: GetSlackConfig = () => {
  const url = nconf.get(SLACK_URL);
  if (url) return { url };
  return undefined;
};

type GetTelegramConfig = () => TelegramConfig | undefined;

const getTelegramConfig: GetTelegramConfig = () => {
  const token = nconf.get(TELEGRAM_TOKEN);
  const chatId = nconf.get(TELEGRAM_CHAT_ID);
  if (token && chatId !== undefined) return { token, chatId };
  return undefined;
};

type GetEmailConfig = () => EmailConfig | undefined;

const getEmailConfig: GetEmailConfig = () => {
  const host = nconf.get(EMAIL_HOST);
  const port = nconf.get(EMAIL_PORT);
  const protocol = nconf.get(EMAIL_PROTOCOL);
  const username = nconf.get(EMAIL_USERNAME);
  const password = nconf.get(EMAIL_PASSWORD);
  const email = nconf.get(EMAIL_EMAIL);
  if (host && port && protocol && email)
    return { host, port, protocol, username, password, email };
  return undefined;
};

type GetDesktopConfig = () => DesktopConfig;

const getDesktopConfig: GetDesktopConfig = () => {
  const enableSound = nconf.get(DESKTOP_SOUND);
  const enabled = nconf.get(DESKTOP_ENABLED);
  return { enabled, enableSound };
};
