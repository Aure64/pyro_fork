import * as nconf from "nconf";
import { promisify } from "util";
import { LogLevelDesc, debug } from "loglevel";
import { SlackConfig } from "./slackNotificationChannel";
import { TelegramConfig } from "./telegramNotificationChannel";
import { EmailConfig } from "./emailNotificationChannel";
import { DesktopConfig } from "./desktopNotificationChannel";
import { EndpointConfig } from "./endpointNotificationChannel";
import * as FS from "fs";
import * as Path from "path";
import envPaths from "env-paths";
import * as yargs from "yargs";
import * as R from "ramda";
import * as Validator from "validatorjs";
import * as Yaml from "js-yaml";

const SYSTEM_PREFIX = "system"; // prefix before system settings
// system prefs
const LAST_BLOCK_LEVEL = `${SYSTEM_PREFIX}:lastBlockLevel`;

// user prefs
type UserPref = {
  key: string;
  default: unknown;
  description: string;
  type: yargs.PositionalOptionsType | undefined;
  alias: string | string[] | undefined;
  group: string | undefined;
  isArray: boolean;
  cliOnly?: boolean;
  validationRule?:
    | string
    | Array<string | Validator.TypeCheckingRule>
    | Validator.Rules;
};

// baker monitor config
const BAKER_GROUP = "Baker Monitor:";
const BAKER: UserPref = {
  key: "baker_monitor:baker",
  default: undefined,
  description: "Node to watch for baking events.",
  alias: ["b", "baker"],
  type: "string",
  group: BAKER_GROUP,
  isArray: true,
  validationRule: "baker",
};
const BAKER_CATCHUP_LIMIT: UserPref = {
  key: "baker_monitor:catchup_limit",
  default: 12288,
  description:
    "The maximum number of blocks to catch up on after reconnecting.",
  alias: undefined,
  type: "number",
  group: BAKER_GROUP,
  isArray: false,
  validationRule: "numeric",
};

const LOG_LEVELS = ["trace", "info", "debug", "warn", "error"];
const LOGGING: UserPref = {
  key: "logging",
  default: "info",
  description: `Level of logging. [${LOG_LEVELS}]`,
  alias: "l",
  type: "string",
  group: undefined,
  isArray: false,
  validationRule: "loglevel",
};
const NODE: UserPref = {
  key: "node",
  default: undefined,
  description: "Node URLs to watch for node events.",
  alias: "n",
  type: "string",
  group: undefined,
  isArray: true,
  validationRule: "url",
};
const RPC: UserPref = {
  key: "rpc",
  default: "https://mainnet-tezos.giganode.io/",
  description: "Tezos RPC URL to query for baker and chain info",
  alias: "r",
  type: "string",
  group: undefined,
  isArray: false,
  validationRule: "url",
};
const EXCLUDED_EVENTS: UserPref = {
  key: "filter:omit",
  default: [
    "FUTURE_BAKING_OPPORTUNITY",
    "FUTURE_ENDORSING_OPPORTUNITY",
    "SUCCESSFUL_ENDORSE",
    "SUCCESSFUL_BAKE",
  ],
  description: "Events to omit from notifications",
  alias: undefined,
  type: "string",
  group: undefined,
  isArray: true,
  validationRule: "string",
};

// email notifier config
const SLACK_NOTIFIER_GROUP = "Slack Notifications:";
const SLACK_ENABLED: UserPref = {
  key: "notifier:slack:enabled",
  default: false,
  description: "Whether slack notifier is enabled",
  alias: undefined,
  type: "boolean",
  group: SLACK_NOTIFIER_GROUP,
  isArray: false,
  validationRule: ["boolean", "required_with:notifier.slack"],
};
const SLACK_URL: UserPref = {
  key: "notifier:slack:url",
  default: undefined,
  description: "Webhook URL for Slack notifications",
  alias: undefined,
  type: "string",
  group: SLACK_NOTIFIER_GROUP,
  isArray: false,
  validationRule: ["url", "required_with:notifier.slack"],
};

// telegram notifier config
const TELEGRAM_NOTIFIER_GROUP = "Telegram Notifications:";

const TELEGRAM_ENABLED: UserPref = {
  key: "notifier:telegram:enabled",
  default: false,
  description: "Whether telegram notifier is enabled",
  alias: undefined,
  type: "boolean",
  group: TELEGRAM_NOTIFIER_GROUP,
  isArray: false,
  validationRule: ["boolean", "required_with:notifier.telegram"],
};
const TELEGRAM_TOKEN: UserPref = {
  key: "notifier:telegram:token",
  default: undefined,
  description: "API token for Telegram notification channel",
  alias: undefined,
  type: "string",
  group: TELEGRAM_NOTIFIER_GROUP,
  isArray: false,
  validationRule: ["string", "required_with:notifier.telegram"],
};
const TELEGRAM_CHAT_ID: UserPref = {
  key: "notifier:telegram:chat",
  default: undefined,
  description: "Bot chat ID for Telegram notification channel",
  alias: undefined,
  type: "string",
  group: TELEGRAM_NOTIFIER_GROUP,
  isArray: false,
  validationRule: ["numeric", "required_with:notifier.telegram"],
};

// email notifier config
//
const EMAIL_NOTIFIER_GROUP = "Email Notifications:";
const EMAIL_ENABLED: UserPref = {
  key: "notifier:email:enabled",
  default: false,
  description: "Whether email notifier is enabled",
  alias: undefined,
  type: "boolean",
  group: EMAIL_NOTIFIER_GROUP,
  isArray: false,
  validationRule: ["boolean", "required_with:notifier.email"],
};
const EMAIL_HOST: UserPref = {
  key: "notifier:email:host",
  default: undefined,
  description: "Host for email notification channel",
  alias: undefined,
  type: "string",
  group: EMAIL_NOTIFIER_GROUP,
  isArray: false,
  validationRule: ["string", "required_with:notifier.email"],
};
const EMAIL_PORT: UserPref = {
  key: "notifier:email:port",
  default: undefined,
  description: "Port for email notification channel",
  alias: undefined,
  type: "number",
  group: EMAIL_NOTIFIER_GROUP,
  isArray: false,
  validationRule: ["numeric", "required_with:notifier.email"],
};
const PROTOCOL_OPTIONS = ["Plain", "SSL", "STARTTLS"];
const EMAIL_PROTOCOL: UserPref = {
  key: "notifier:email:protocol",
  default: undefined,
  description: `Protocol for email notification channel [${PROTOCOL_OPTIONS}]`,
  alias: undefined,
  type: "string",
  group: EMAIL_NOTIFIER_GROUP,
  isArray: false,
  validationRule: ["email_protocol", "required_with:notifier.email"],
};
const EMAIL_USERNAME: UserPref = {
  key: "notifier:email:username",
  default: undefined,
  description: "Username for email notification channel",
  alias: undefined,
  type: "string",
  group: EMAIL_NOTIFIER_GROUP,
  isArray: false,
  validationRule: ["string", "required_with:notifier.email"],
};
const EMAIL_PASSWORD: UserPref = {
  key: "notifier:email:password",
  default: undefined,
  description: "Password for email notification channel",
  alias: undefined,
  type: "string",
  group: EMAIL_NOTIFIER_GROUP,
  isArray: false,
  validationRule: ["string", "required_with:notifier.email"],
};
const EMAIL_EMAIL: UserPref = {
  key: "notifier:email:email",
  default: undefined,
  description: "Address for email notifier channel",
  alias: undefined,
  type: "string",
  group: EMAIL_NOTIFIER_GROUP,
  isArray: false,
  validationRule: ["string", "required_with:notifier.email"],
};

// desktop notifier config
const DESKTOP_NOTIFIER_GROUP = "Desktop Notifications:";
const DESKTOP_ENABLED: UserPref = {
  key: "notifier:desktop:enabled",
  default: false,
  description: "Whether desktop notifier is enabled",
  alias: undefined,
  type: "boolean",
  group: DESKTOP_NOTIFIER_GROUP,
  isArray: false,
  validationRule: ["boolean", "required_with:notifier.desktop"],
};
const DESKTOP_SOUND: UserPref = {
  key: "notifier:desktop:sound",
  default: false,
  description: "Whether desktop notifier should use sound",
  alias: undefined,
  type: "boolean",
  group: DESKTOP_NOTIFIER_GROUP,
  isArray: false,
  validationRule: ["boolean", "required_with:notifier.desktop"],
};
// endpoint notifier config
const ENDPOINT_NOTIFIER_GROUP = "Endpoint Notifications:";
const ENDPOINT_ENABLED: UserPref = {
  key: "notifier:endpoint:enabled",
  default: false,
  description: "Whether endpoint notifier is enabled",
  alias: undefined,
  type: "boolean",
  group: ENDPOINT_NOTIFIER_GROUP,
  isArray: false,
  validationRule: ["boolean", "required_with:notifier.endpoint"],
};
const ENDPOINT_URL: UserPref = {
  key: "notifier:endpoint:url",
  default: undefined,
  description: "URL for posting raw JSON notifications",
  alias: undefined,
  type: "string",
  group: ENDPOINT_NOTIFIER_GROUP,
  isArray: false,
  validationRule: ["boolean", "required_with:notifier.endpoint"],
};
const CONFIG_FILE: UserPref = {
  key: "config",
  default: undefined,
  description:
    "Path to config file.  If present, it will override the default user config file.",
  alias: undefined,
  type: "string",
  group: undefined,
  isArray: false,
  cliOnly: true,
  validationRule: "string",
};

// list of all prefs that should be iterated to build yargs options and nconf defaults
const userPrefs = [
  BAKER,
  BAKER_CATCHUP_LIMIT,
  LOGGING,
  NODE,
  RPC,
  EXCLUDED_EVENTS,
  SLACK_ENABLED,
  SLACK_URL,
  TELEGRAM_ENABLED,
  TELEGRAM_TOKEN,
  TELEGRAM_CHAT_ID,
  EMAIL_ENABLED,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_PROTOCOL,
  EMAIL_EMAIL,
  EMAIL_USERNAME,
  EMAIL_PASSWORD,
  DESKTOP_ENABLED,
  DESKTOP_SOUND,
  ENDPOINT_ENABLED,
  ENDPOINT_URL,
  CONFIG_FILE,
];

/**
 * Iterates through the UserPrefs to create the Yarg settings used for parsing and providing help
 * for argv options.
 */
const makeYargOptions = () => {
  const options = userPrefs.reduce(
    (accumulator: { [key: string]: yargs.Options }, pref: UserPref) => {
      const defaultDescription =
        pref.default !== undefined ? `${pref.default}` : undefined;
      accumulator[pref.key] = {
        type: pref.type,
        alias: pref.alias,
        description: pref.description,
        defaultDescription,
        group: pref.group,
        array: pref.isArray,
      };
      return accumulator;
    },
    {}
  );
  return options;
};

/**
 * Iterates through the UserPrefs to create an object of default config values for Nconf.
 */
const makeConfigDefaults = () => {
  const defaults = userPrefs.reduce(
    (accumulator: { [key: string]: unknown }, pref: UserPref) => {
      if (pref.default !== undefined) {
        const objectPath = pref.key.split(":");
        // create Ramda lens for writing to that path (simplest way to ensure entire path exists)
        const lensPath = R.lensPath(objectPath);
        const updatedAccumulator = R.set(lensPath, pref.default, accumulator);
        return updatedAccumulator;
      }
      return accumulator;
    },
    {}
  );
  return defaults;
};

/**
 * Calls makeConfigFile and writes the result to the specified path.
 */
const writeSampleConfig = (path: string) => {
  console.log(`Creating User Config file at ${path}`);
  console.log(
    "Note: config has invalid placeholder data that must be replaced before this config can be used."
  );
  const sampleConfig = makeConfigFile();
  FS.writeFileSync(path, JSON.stringify(sampleConfig, null, 2));
};

/**
 * Creates a sample config, with the proper structure.  The values will be populated with defaults where
 * present, otherwise placeholder text with the option's description and type.
 */
const makeConfigFile = (): Record<string, string> => {
  const sampleConfig = userPrefs.reduce(
    (accumulator: Record<string, string>, userPref: UserPref) => {
      // ignore user prefs that are only supported by the command line
      if (!userPref.cliOnly) {
        const fieldType = userPref.isArray ? "array" : userPref.type;
        const value =
          userPref.default !== undefined
            ? userPref.default
            : `${userPref.description} [${fieldType}]`;
        return setPath(userPref.key, accumulator, value);
      } else {
        return accumulator;
      }
    },
    {}
  );
  return sampleConfig;
};

/**
 * Iterates through the UserPrefs to create the validations object used by validatorjs.  Also creates a
 * few custom validators for specific fields.
 */
const makeConfigValidations = (): Validator.Rules => {
  const bakerRegex = new RegExp(/^tz[\d\w]*$/);
  Validator.register(
    "baker",
    (value) => {
      return bakerRegex.test(`${value}`);
    },
    "The :attribute is not a proper baker hash."
  );
  Validator.register(
    "loglevel",
    (value) => {
      return LOG_LEVELS.includes(`${value}`);
    },
    "The :attribute is not a valid log level."
  );
  Validator.register(
    "email_protocol",
    (value) => {
      return PROTOCOL_OPTIONS.includes(`${value}`);
    },
    "The :attribute is not a valid email protocol."
  );

  const rules = userPrefs.reduce(
    (accumulator: Validator.Rules, userPref: UserPref) => {
      const validationRule = userPref.validationRule;
      if (validationRule && userPref.isArray) {
        const settingsWithArrayRule = setPath(
          userPref.key,
          accumulator,
          "array"
        );
        // array validations belong on key.*
        const childKey = `${userPref.key}.*`;
        return setPath(childKey, settingsWithArrayRule, validationRule);
      } else if (validationRule) {
        return setPath(userPref.key, accumulator, validationRule);
      } else {
        return accumulator;
      }
    },
    {}
  );
  return rules;
};

/**
 * Creates a new `data` with the `value` set to the nested `path`.  `path` is a UserPref style path
 * delimited by colons.
 */
const setPath = <T>(path: string, data: T, value: unknown): T => {
  const objectPath = path.split(":");
  // create Ramda lens for writing to that path (simplest way to ensure entire path exists)
  const lensPath = R.lensPath(objectPath);
  return R.set(lensPath, value, data);
};

const userConfigPath = (path: string) => Path.join(path, "config.json");
const systemConfigPath = (path: string) => Path.join(path, "system.json");

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
  getBakerCatchupLimit: GetBakerCatchupLimit;
};

/**
 * Load config settings from argv and the file system.  File system will use the path from envPaths
 * unless overriden by argv.
 */
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
      .command(
        "create-config <path>",
        "Create a sample user config at the provided path.",
        () => {
          /* not used.  See more at https://github.com/yargs/yargs/blob/master/docs/api.md#command */
        },
        ({ path }: { path: string }) => {
          writeSampleConfig(path);
          process.exit(1);
        }
      )
  );
  // user config file from argv overrides default location
  const configPath =
    nconf.get(CONFIG_FILE.key) || userConfigPath(configDirectory);
  nconf.file("user", configPath);
  nconf.file("system", systemConfigPath(configDirectory));
  nconf.defaults(makeConfigDefaults());

  const loadAsync = promisify(nconf.load.bind(nconf));
  await loadAsync().then(console.log);
  const loadedConfig = nconf.get();
  const validation = new Validator(loadedConfig, makeConfigValidations());
  if (validation.fails()) {
    console.log("Your config is invalid. Kiln cannot start.");
    const errors = validation.errors.all();
    console.log(Yaml.dump(errors));
    process.exit(1);
  }

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
    getBakerCatchupLimit,
  };
  return config;
};

const save = (path: string): void => {
  // read in system config.  Kiln currently doesn't update user settings
  const { [SYSTEM_PREFIX]: systemSettings } = nconf.get();
  debug("Saving config to disk.");
  // save system config
  if (systemSettings) {
    FS.writeFileSync(
      systemConfigPath(path),
      JSON.stringify({ system: systemSettings })
    );
  }
};

type GetBakers = () => string[];

const getBakers: GetBakers = () => {
  return nconf.get(BAKER.key) || [];
};

type GetRpc = () => string;

const getRpc: GetRpc = () => {
  return nconf.get(RPC.key);
};

type GetNodes = () => string[];
const getNodes: GetNodes = () => {
  return nconf.get(NODE.key) || [];
};

type GetLogLevel = () => LogLevelDesc;

const getLogLevel: GetLogLevel = () => {
  const value = nconf.get(LOGGING.key);
  return logLevelFromString(value);
};

const logLevelFromString = (value: string): LogLevelDesc => {
  return value as LogLevelDesc;
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
  const enabled = nconf.get(SLACK_ENABLED.key);
  const url = nconf.get(SLACK_URL.key);
  if (url) return { enabled, url };
  return undefined;
};

type GetTelegramConfig = () => TelegramConfig | undefined;

const getTelegramConfig: GetTelegramConfig = () => {
  const enabled = nconf.get(TELEGRAM_ENABLED.key);
  const token = nconf.get(TELEGRAM_TOKEN.key);
  const chatId = nconf.get(TELEGRAM_CHAT_ID.key);
  if (token && chatId !== undefined) return { enabled, token, chatId };
  return undefined;
};

type GetEmailConfig = () => EmailConfig | undefined;

const getEmailConfig: GetEmailConfig = () => {
  const enabled = nconf.get(EMAIL_ENABLED.key);
  const host = nconf.get(EMAIL_HOST.key);
  const port = nconf.get(EMAIL_PORT.key);
  const protocol = nconf.get(EMAIL_PROTOCOL.key);
  const username = nconf.get(EMAIL_USERNAME.key);
  const password = nconf.get(EMAIL_PASSWORD.key);
  const email = nconf.get(EMAIL_EMAIL.key);
  if (host && port && protocol && email)
    return { enabled, host, port, protocol, username, password, email };
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
  const enabled = nconf.get(ENDPOINT_ENABLED.key);
  const url = nconf.get(ENDPOINT_URL.key);
  if (url) return { enabled, url };
  return undefined;
};

type GetStorageDirectory = () => string;

type GetBakerCatchupLimit = () => number | undefined;

const getBakerCatchupLimit: GetBakerCatchupLimit = () => {
  return nconf.get(BAKER_CATCHUP_LIMIT.key);
};
