import * as nconf from "nconf";
import { promisify } from "util";
import { LogLevelDesc, trace } from "loglevel";
import { SlackConfig } from "./senders/slack";
import { TelegramConfig } from "./senders/telegram";
import { EmailConfig } from "./senders/email";
import { DesktopConfig } from "./senders/desktop";
import { EndpointConfig } from "./senders/http";
import * as FS from "fs";
import * as Path from "path";
import envPaths from "env-paths";
import * as yargs from "yargs";
import * as R from "ramda";
import * as Validator from "validatorjs";
import { eventKinds } from "./types";

const SYSTEM_PREFIX = "system"; // prefix before system settings

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
  default: 120,
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
  validationRule: "link",
};
const RPC: UserPref = {
  key: "rpc",
  default: "https://mainnet-tezos.giganode.io/",
  description: "Tezos RPC URL to query for baker and chain info",
  alias: "r",
  type: "string",
  group: undefined,
  isArray: false,
  validationRule: "link",
};
const REFERENCE_NODE: UserPref = {
  key: "reference-node",
  default: undefined,
  description:
    "Node to compare to when detecting if monitored node is on a branch",
  alias: "R",
  type: "string",
  group: undefined,
  isArray: false,
  validationRule: "link",
};

const EXCLUDED_EVENTS: UserPref = {
  key: "filter:omit",
  default: [
    "FUTURE_BAKING_OPPORTUNITY",
    "FUTURE_ENDORSING_OPPORTUNITY",
    "SUCCESSFUL_ENDORSE",
    "SUCCESSFUL_BAKE",
  ],
  description: `Events to omit from notifications\nAvailable options: ${eventKinds.join(
    ", "
  )}`,
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
  default: undefined,
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
  validationRule: ["link", "required_with:notifier.slack"],
};

// telegram notifier config
const TELEGRAM_NOTIFIER_GROUP = "Telegram Notifications:";

const TELEGRAM_ENABLED: UserPref = {
  key: "notifier:telegram:enabled",
  default: undefined,
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

// email notifier config
//
const EMAIL_NOTIFIER_GROUP = "Email Notifications:";
const EMAIL_ENABLED: UserPref = {
  key: "notifier:email:enabled",
  default: undefined,
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
  validationRule: "string",
};
const EMAIL_PASSWORD: UserPref = {
  key: "notifier:email:password",
  default: undefined,
  description: "Password for email notification channel",
  alias: undefined,
  type: "string",
  group: EMAIL_NOTIFIER_GROUP,
  isArray: false,
  validationRule: "string",
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
  default: true,
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
  default: undefined,
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
  validationRule: ["link", "required_with:notifier.endpoint"],
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

// queue config
const QUEUE_GROUP = "Notification Queues:";
const QUEUE_RETRIES: UserPref = {
  key: "notifier:queue:max_retries",
  default: 10,
  description: "Maximum number of times to retry notifications",
  alias: undefined,
  type: "number",
  group: QUEUE_GROUP,
  isArray: false,
  validationRule: "numeric",
};
const QUEUE_DELAY: UserPref = {
  key: "notifier:queue:retry_delay",
  default: 60000,
  description: "Delay between retries in milliseconds",
  alias: undefined,
  type: "number",
  group: QUEUE_GROUP,
  isArray: false,
  validationRule: "numeric",
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
  QUEUE_RETRIES,
  QUEUE_DELAY,
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
  // Validator's URL regex is strict and doesn't accept localhost or IP addresses
  const linkRegex = /^https?:\/\/[^/\s]+(\/.*)?$/;
  Validator.register(
    "link",
    (value) => {
      return linkRegex.test(`${value}`);
    },
    "The :attribute is not a valid link."
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

const makeUserConfigPath = (path: string) => Path.join(path, "config.json");
const makeSystemConfigPath = (path: string) => Path.join(path, "system.json");

export type Config = {
  save: () => void;
  getBakers: GetBakers;
  getRpc: GetRpc;
  getReferenceNode: GetReferenceNode;
  getNodes: GetNodes;
  getLogLevel: GetLogLevel;
  getExcludedEvents: GetExcludedEvents;
  getSlackConfig: GetSlackConfig;
  getTelegramConfig: GetTelegramConfig;
  getEmailConfig: GetEmailConfig;
  getDesktopConfig: GetDesktopConfig;
  getEndpointConfig: GetEndpointConfig;
  storageDirectory: string;
  getBakerCatchupLimit: GetBakerCatchupLimit;
  getQueueConfig: GetQueueConfig;
};

const formatValidationErrors = (errors: Validator.ValidationErrors): string => {
  const formatted = Object.entries(errors)
    .map(
      ([field, messages]) =>
        `${field}:\n${messages.map((m) => "  * " + m).join("\n")}`
    )
    .join("\n");
  return formatted;
};

/**
 * Load config settings from argv and the file system.  File system will use the path from envPaths
 * unless overriden by argv.
 */
export const load = async (): Promise<Config> => {
  const { data: dataDirectory, config: configDirectory } = envPaths(
    "pyrometer",
    { suffix: "" }
  );
  console.log("Data directory:", dataDirectory);
  console.log("Config directory:", configDirectory);

  // ensure system directories exist
  createDirectory(dataDirectory);
  createDirectory(configDirectory);

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
          process.exit(0);
        }
      )
      .command(
        "print-config",
        "Print the entire config, derived from the CLI and config files.",
        () => {
          /* not used.  See more at https://github.com/yargs/yargs/blob/master/docs/api.md#command */
        },
        () => {
          setTimeout(() => {
            printConfig();
            process.exit(0);
          }, 1000);
        }
      )
      .command(
        "clear-data",
        "Deletes all system data, including job queues and block history.",
        () => {
          /* not used.  See more at https://github.com/yargs/yargs/blob/master/docs/api.md#command */
        },
        () => {
          clearData({ dataDirectory, configDirectory });
          process.exit(0);
        }
      )
  );
  // user config file from argv overrides default location
  const configPath =
    nconf.get(CONFIG_FILE.key) || makeUserConfigPath(configDirectory);
  nconf.file("user", configPath);
  const systemConfigPath = makeSystemConfigPath(configDirectory);
  nconf.file("system", systemConfigPath);
  nconf.defaults(makeConfigDefaults());

  const loadAsync = promisify(nconf.load.bind(nconf));
  await loadAsync();
  const loadedConfig = nconf.get();
  const validation = new Validator(loadedConfig, makeConfigValidations());
  if (validation.fails()) {
    console.log("Your config is invalid. Pyrometer cannot start.");
    const errors = validation.errors.all();
    console.log(formatValidationErrors(errors));
    process.exit(1);
  }

  const saveConfig = () => save(systemConfigPath);

  const config: Config = {
    save: saveConfig,
    getBakers,
    getRpc,
    getReferenceNode,
    getNodes,
    getLogLevel,
    getExcludedEvents,
    getSlackConfig,
    getTelegramConfig,
    getEmailConfig,
    getDesktopConfig,
    getEndpointConfig,
    storageDirectory: dataDirectory,
    getBakerCatchupLimit,
    getQueueConfig,
  };
  return config;
};

const save = (systemConfigPath: string): void => {
  // read in system config.  Pyrometer currently doesn't update user settings
  const { [SYSTEM_PREFIX]: systemSettings } = nconf.get();
  trace("Saving config to disk.");
  // save system config
  if (systemSettings) {
    FS.writeFileSync(
      systemConfigPath,
      JSON.stringify({ system: systemSettings }, null, 2)
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

type GetReferenceNode = () => string | undefined;

const getReferenceNode: GetReferenceNode = () => {
  return nconf.get(REFERENCE_NODE.key);
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
  if (token) return { enabled, token };
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

type GetBakerCatchupLimit = () => number;

const getBakerCatchupLimit: GetBakerCatchupLimit = () => {
  return nconf.get(BAKER_CATCHUP_LIMIT.key);
};

const printConfig = () => {
  console.log(JSON.stringify(nconf.get(), null, 2));
};

type ClearDataArgs = {
  dataDirectory: string;
  configDirectory: string;
};

const clearData = ({ dataDirectory, configDirectory }: ClearDataArgs) => {
  if (FS.existsSync(dataDirectory)) {
    FS.rmdirSync(dataDirectory, { recursive: true });
    console.log(`Data directory deleted: ${dataDirectory}`);
  } else {
    console.log("Data directory does not exist");
  }
  const systemConfigPath = makeSystemConfigPath(configDirectory);
  if (FS.existsSync(systemConfigPath)) {
    FS.rmSync(systemConfigPath);
    console.log(`System config deleted: ${systemConfigPath}`);
  } else {
    console.log(`System config does not exist: ${systemConfigPath}`);
  }
};

const createDirectory = (path: string) => {
  if (!FS.existsSync(path)) {
    console.log(`Creating directory: ${path}`);
    FS.mkdirSync(path, { recursive: true });
  }
};

type GetQueueConfig = () => {
  maxRetries: number;
  retryDelay: number;
};

const getQueueConfig: GetQueueConfig = () => {
  const maxRetries = nconf.get(QUEUE_RETRIES.key);
  const retryDelay = nconf.get(QUEUE_DELAY.key);
  return {
    maxRetries,
    retryDelay,
  };
};
