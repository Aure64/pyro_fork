import * as nconf from "nconf";
import { promisify } from "util";
import { LogLevelDesc } from "loglevel";
import * as TOML from "@iarna/toml";

import envPaths from "env-paths";

import {
  validateAddress,
  ValidationResult as TzValidationResult,
} from "@taquito/utils";

import { SlackConfig } from "./senders/slack";
import { TelegramConfig } from "./senders/telegram";
import { EmailConfig } from "./senders/email";
import { DesktopConfig } from "./senders/desktop";
import { WebhookConfig } from "./senders/http";
import { NotificationsConfig } from "./channel";
import { BakerMonitorConfig } from "./bakerMonitor";
import { NodeMonitorConfig } from "./nodeMonitor";
import * as FS from "fs";
import * as Path from "path";
import * as yargs from "yargs";
import * as Validator from "validatorjs";
import { Kind as Events } from "./types2";

import setPath from "./setPath";

type UserPref = {
  key: string;
  default: unknown;
  description: string;
  sampleValue?: any;
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

type Group = { key: string; label: string };

const BAKER_GROUP: Group = { key: "baker_monitor", label: "Baker Monitor:" };

const BAKERS: UserPref = {
  key: `${BAKER_GROUP.key}:bakers`,
  default: [],
  sampleValue: [
    "tz1S8MNvuFEUsWgjHvi3AxibRBf388NhT1q2",
    "tz1aRoaRhSpRYvFdyvgWLL6TGyRoGF51wDjM",
    "tz2FCNBrERXtaTtNX6iimR1UJ5JSDxvdHM93",
  ],
  description: "Baker address to monitor",
  alias: ["b", "bakers"],
  type: "string",
  group: BAKER_GROUP.label,
  isArray: true,
  validationRule: "baker",
};

const BAKER_CATCHUP_LIMIT: UserPref = {
  key: `${BAKER_GROUP.key}:max_catchup_blocks`,
  default: 120,
  description:
    "The maximum number of blocks to catch up on after reconnecting.",
  alias: undefined,
  type: "number",
  group: BAKER_GROUP.label,
  isArray: false,
  validationRule: "numeric",
};

const RPC: UserPref = {
  key: `${BAKER_GROUP.key}:rpc`,
  default: "https://mainnet-tezos.giganode.io/",
  description: "Tezos RPC URL to query for baker and chain info",
  alias: ["r", "rpc"],
  type: "string",
  group: BAKER_GROUP.label,
  isArray: false,
  validationRule: "link",
};

const LOG_GROUP = "Logging:";
const LOG_LEVELS = ["trace", "info", "debug", "warn", "error"];

const LOG_LEVEL: UserPref = {
  key: "log:level",
  default: "info",
  description: `Level of logging. [${LOG_LEVELS}]`,
  alias: "l",
  type: "string",
  group: LOG_GROUP,
  isArray: false,
  validationRule: "loglevel",
};

const DATA_DIR: UserPref = {
  key: "data_dir",
  default: envPaths("pyrometer", { suffix: "" }).data,
  description: "Data directory",
  alias: ["d", "data-dir"],
  type: "string",
  group: undefined,
  isArray: false,
  validationRule: "string",
};

const NODE_MONITOR_GROUP: Group = {
  key: "node_monitor",
  label: "Node Monitor:",
};

const NODES: UserPref = {
  key: `${NODE_MONITOR_GROUP.key}:nodes`,
  default: [],
  sampleValue: ["http://localhost:8732"],
  description: "Node RPC URLs to watch for node events.",
  alias: ["n", "nodes"],
  type: "string",
  group: NODE_MONITOR_GROUP.label,
  isArray: true,
  validationRule: "link",
};

const REFERENCE_NODE: UserPref = {
  key: `${NODE_MONITOR_GROUP.key}:reference_node`,
  default: undefined,
  sampleValue: "https://mainnet-tezos.giganode.io/",
  description:
    "Node to compare to when detecting if monitored node is on a branch",
  alias: ["R", "reference-node"],
  type: "string",
  group: NODE_MONITOR_GROUP.label,
  isArray: false,
  validationRule: "link",
};

const EXCLUDED_EVENTS: UserPref = {
  key: "exclude",
  default: [
    Events.BakeScheduled,
    Events.EndorsementScheduled,
    Events.Baked,
    Events.Endorsed,
  ],
  description: `Events to omit from notifications\nAvailable options: ${Object.values(
    Events
  ).join(", ")}`,
  alias: undefined,
  type: "string",
  group: undefined,
  isArray: true,
  validationRule: "string",
};

const SLACK_GROUP = "Slack Notifications:";
const SLACK_KEY = "slack";

const SLACK_ENABLED: UserPref = {
  key: `${SLACK_KEY}:enabled`,
  default: false,
  description: "Whether slack notifier is enabled",
  alias: undefined,
  type: "boolean",
  group: SLACK_GROUP,
  isArray: false,
  validationRule: "boolean",
};

const SLACK_URL: UserPref = {
  key: `${SLACK_KEY}:url`,
  default: undefined,
  sampleValue:
    "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
  description: "Webhook URL for Slack notifications",
  alias: undefined,
  type: "string",
  group: SLACK_GROUP,
  isArray: false,
  validationRule: ["link", { required_if: [`${SLACK_KEY}.enabled`, true] }],
};

const SLACK_EMOJI: UserPref = {
  key: `${SLACK_KEY}:emoji`,
  default: true,
  description: "Use emoji in notification text",
  alias: undefined,
  type: "boolean",
  group: SLACK_GROUP,
  isArray: false,
  validationRule: ["boolean"],
};

const SLACK_SHORT_ADDRESS: UserPref = {
  key: `${SLACK_KEY}:short_address`,
  default: true,
  description: "Abbreviate baker addresses in notification text",
  alias: undefined,
  type: "boolean",
  group: SLACK_GROUP,
  isArray: false,
  validationRule: ["boolean"],
};

const TELEGRAM_GROUP = "Telegram Notifications:";
const TELEGRAM_KEY = "telegram";

const TELEGRAM_ENABLED: UserPref = {
  key: `${TELEGRAM_KEY}:enabled`,
  default: false,
  description: "Whether telegram notifier is enabled",
  alias: undefined,
  type: "boolean",
  group: TELEGRAM_GROUP,
  isArray: false,
  validationRule: ["boolean"],
};

const TELEGRAM_TOKEN: UserPref = {
  key: `${TELEGRAM_KEY}:token`,
  default: undefined,
  sampleValue: "1234567890:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  description: "API token for Telegram notification channel",
  alias: undefined,
  type: "string",
  group: TELEGRAM_GROUP,
  isArray: false,
  validationRule: [
    "string",
    { required_if: [`${TELEGRAM_KEY}.enabled`, true] },
  ],
};

const TELEGRAM_EMOJI: UserPref = {
  key: `${TELEGRAM_KEY}:emoji`,
  default: true,
  description: "Use emoji in notification text",
  alias: undefined,
  type: "boolean",
  group: TELEGRAM_GROUP,
  isArray: false,
  validationRule: ["boolean"],
};

const TELEGRAM_SHORT_ADDRESS: UserPref = {
  key: `${TELEGRAM_KEY}:short_address`,
  default: true,
  description: "Abbreviate baker addresses in notification text",
  alias: undefined,
  type: "boolean",
  group: TELEGRAM_GROUP,
  isArray: false,
  validationRule: ["boolean"],
};

const EMAIL_GROUP = "Email Notifications:";
const EMAIL_KEY = "email";
const EMAIL_REQUIRED = { required_if: [`${EMAIL_KEY}.enabled`, true] };

const EMAIL_ENABLED: UserPref = {
  key: `${EMAIL_KEY}:enabled`,
  default: false,
  description: "Whether email notifier is enabled",
  alias: undefined,
  type: "boolean",
  group: EMAIL_GROUP,
  isArray: false,
  validationRule: ["boolean"],
};

const EMAIL_HOST: UserPref = {
  key: `${EMAIL_KEY}:host`,
  default: undefined,
  description: "Host for email notification channel",
  sampleValue: "localhost",
  alias: undefined,
  type: "string",
  group: EMAIL_GROUP,
  isArray: false,
  validationRule: ["string", EMAIL_REQUIRED],
};

const EMAIL_PORT: UserPref = {
  key: `${EMAIL_KEY}:port`,
  default: undefined,
  sampleValue: 25,
  description: "Port for email notification channel",
  alias: undefined,
  type: "number",
  group: EMAIL_GROUP,
  isArray: false,
  validationRule: ["numeric", EMAIL_REQUIRED],
};

const PROTOCOL_OPTIONS = ["PLAIN", "SSL", "STARTTLS"];

const EMAIL_PROTOCOL: UserPref = {
  key: `${EMAIL_KEY}:protocol`,
  default: "PLAIN",
  description: `Protocol for email notification channel [${PROTOCOL_OPTIONS}]`,
  alias: undefined,
  type: "string",
  group: EMAIL_GROUP,
  isArray: false,
  validationRule: ["email_protocol"],
};

const EMAIL_USERNAME: UserPref = {
  key: `${EMAIL_KEY}:username`,
  default: undefined,
  sampleValue: "",
  description: "Username for email notification channel",
  alias: undefined,
  type: "string",
  group: EMAIL_GROUP,
  isArray: false,
  validationRule: "string",
};

const EMAIL_PASSWORD: UserPref = {
  key: `${EMAIL_KEY}:password`,
  default: undefined,
  sampleValue: "",
  description: "Password for email notification channel",
  alias: undefined,
  type: "string",
  group: EMAIL_GROUP,
  isArray: false,
  validationRule: "string",
};

const EMAIL_TO: UserPref = {
  key: `${EMAIL_KEY}:to`,
  default: undefined,
  sampleValue: ["me@example.org"],
  description: "Address for email notifier channel",
  alias: undefined,
  type: "string",
  group: EMAIL_GROUP,
  isArray: true,
  validationRule: ["email", EMAIL_REQUIRED],
};

const EMAIL_FROM: UserPref = {
  key: `${EMAIL_KEY}:from`,
  default: undefined,
  sampleValue: ["Pyrometer <me@example.org>"],
  description:
    "Email's 'Form:' address, by default same as the first 'To:' address",
  alias: undefined,
  type: "string",
  group: EMAIL_GROUP,
  isArray: false,
  validationRule: ["string"],
};

const EMAIL_EMOJI: UserPref = {
  key: `${EMAIL_KEY}:emoji`,
  default: true,
  description: "Use emoji in notification text",
  alias: undefined,
  type: "boolean",
  group: EMAIL_GROUP,
  isArray: false,
  validationRule: ["boolean"],
};

const EMAIL_SHORT_ADDRESS: UserPref = {
  key: `${EMAIL_KEY}:short_address`,
  default: true,
  description: "Abbreviate baker addresses in notification text",
  alias: undefined,
  type: "boolean",
  group: EMAIL_GROUP,
  isArray: false,
  validationRule: ["boolean"],
};

const DESKTOP_GROUP = "Desktop Notifications:";
const DESKTOP_KEY = "desktop";

const DESKTOP_ENABLED: UserPref = {
  key: `${DESKTOP_KEY}:enabled`,
  default: false,
  description: "Whether desktop notifier is enabled",
  alias: undefined,
  type: "boolean",
  group: DESKTOP_GROUP,
  isArray: false,
  validationRule: "boolean",
};

const DESKTOP_SOUND: UserPref = {
  key: `${DESKTOP_KEY}:sound`,
  default: false,
  description: "Whether desktop notifier should use sound",
  alias: undefined,
  type: "boolean",
  group: DESKTOP_GROUP,
  isArray: false,
  validationRule: "boolean",
};

const DESKTOP_EMOJI: UserPref = {
  key: `${DESKTOP_KEY}:emoji`,
  default: true,
  description: "Use emoji in notification text",
  alias: undefined,
  type: "boolean",
  group: DESKTOP_GROUP,
  isArray: false,
  validationRule: ["boolean"],
};

const DESKTOP_SHORT_ADDRESS: UserPref = {
  key: `${DESKTOP_KEY}:short_address`,
  default: true,
  description: "Abbreviate baker addresses in notification text",
  alias: undefined,
  type: "boolean",
  group: DESKTOP_GROUP,
  isArray: false,
  validationRule: ["boolean"],
};

const WEBHOOK_GROUP = "Webhook Notifications:";
const WEBHOOK_KEY = "webhook";

const WEBHOOK_ENABLED: UserPref = {
  key: `${WEBHOOK_KEY}:enabled`,
  default: false,
  description: "Whether webhook notifier is enabled",
  alias: undefined,
  type: "boolean",
  group: WEBHOOK_GROUP,
  isArray: false,
  validationRule: "boolean",
};

const WEBHOOK_URL: UserPref = {
  key: `${WEBHOOK_KEY}:url`,
  default: undefined,
  sampleValue: "http://192.168.1.10/mywebhook",
  description: "URL for posting raw JSON notifications",
  alias: undefined,
  type: "string",
  group: WEBHOOK_GROUP,
  isArray: false,
  validationRule: ["link", { required_if: [`${WEBHOOK_KEY}.enabled`, true] }],
};

const { config: configDirectory } = envPaths("pyrometer", { suffix: "" });

const CONFIG_FILE: UserPref = {
  key: "config",
  default: Path.join(configDirectory, "pyrometer.toml"),
  description: "Path to configuration file.",
  alias: "c",
  type: "string",
  group: undefined,
  isArray: false,
  cliOnly: true,
  validationRule: "string",
};

const NOTIFICATIONS_GROUP = "Notifications:";
const NOTIFICATIONS_KEY = "notifications";

const NOTIFICATIONS_MAX_BATCH_SIZE: UserPref = {
  key: `${NOTIFICATIONS_KEY}:max_batch_size`,
  default: 100,
  description: "Maximum number of events to process in one batch",
  alias: undefined,
  type: "number",
  group: NOTIFICATIONS_GROUP,
  isArray: false,
  validationRule: "numeric",
};

const NOTIFICATIONS_INTERVAL: UserPref = {
  key: `${NOTIFICATIONS_KEY}:interval`,
  default: 60,
  description:
    "Post notifications for accumulated events at this interval (in seconds)",
  alias: undefined,
  type: "number",
  group: NOTIFICATIONS_GROUP,
  isArray: false,
  validationRule: "numeric",
};

const NOTIFICATIONS_TTL: UserPref = {
  key: `${NOTIFICATIONS_KEY}:ttl`,
  default: 24 * 60 * 60,
  description: "Time to live for queued up events (in seconds)",
  alias: undefined,
  type: "number",
  group: NOTIFICATIONS_GROUP,
  isArray: false,
  validationRule: "numeric",
};

// list of all prefs that should be iterated to build yargs options and nconf defaults
const userPrefs = [
  BAKERS,
  BAKER_CATCHUP_LIMIT,
  DATA_DIR,
  LOG_LEVEL,
  NODES,
  RPC,
  REFERENCE_NODE,
  EXCLUDED_EVENTS,
  SLACK_ENABLED,
  SLACK_URL,
  SLACK_EMOJI,
  SLACK_SHORT_ADDRESS,
  TELEGRAM_ENABLED,
  TELEGRAM_TOKEN,
  TELEGRAM_EMOJI,
  TELEGRAM_SHORT_ADDRESS,
  EMAIL_ENABLED,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_PROTOCOL,
  EMAIL_TO,
  EMAIL_FROM,
  EMAIL_USERNAME,
  EMAIL_PASSWORD,
  EMAIL_EMOJI,
  EMAIL_SHORT_ADDRESS,
  DESKTOP_ENABLED,
  DESKTOP_SOUND,
  DESKTOP_EMOJI,
  DESKTOP_SHORT_ADDRESS,
  WEBHOOK_ENABLED,
  WEBHOOK_URL,
  CONFIG_FILE,
  NOTIFICATIONS_INTERVAL,
  NOTIFICATIONS_MAX_BATCH_SIZE,
  NOTIFICATIONS_TTL,
];

/**
 * Iterates through the UserPrefs to create the Yarg settings used for parsing and providing help
 * for argv options.
 */
const makeYargOptions = (userPrefs: UserPref[]) => {
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

export const yargRunOptions = makeYargOptions(userPrefs);
export const yargResetOptions = makeYargOptions([DATA_DIR, CONFIG_FILE]);

/**
 * Iterates through the UserPrefs to create an object of default config values for Nconf.
 */
const makeConfigDefaults = () => {
  const defaults = userPrefs.reduce(
    (accumulator: { [key: string]: unknown }, pref: UserPref) => {
      if (pref.default !== undefined) {
        return setPath(pref.key, accumulator, pref.default);
      }
      return accumulator;
    },
    {}
  );
  return defaults;
};

export const makeSampleConfig = (): Record<string, string> => {
  const sampleConfig = userPrefs.reduce(
    (accumulator: Record<string, string>, userPref: UserPref) => {
      // ignore user prefs that are only supported by the command line
      if (!userPref.cliOnly) {
        const value =
          userPref.default !== undefined
            ? userPref.default
            : userPref.sampleValue;
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
  Validator.register(
    "baker",
    (value) => {
      return validateAddress(value) === TzValidationResult.VALID;
    },
    "The :attribute is not a valid baker address."
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

export type Config = {
  bakerMonitor: BakerMonitorConfig;
  nodeMonitor: NodeMonitorConfig;
  logLevel: LogLevelDesc;
  excludedEvents: Events[];
  slack: SlackConfig;
  telegram: TelegramConfig;
  email: EmailConfig;
  desktop: DesktopConfig;
  webhook: WebhookConfig;
  storageDirectory: string;
  notifications: NotificationsConfig;
  asObject: () => any;
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
export const load = async (
  yargOptions = yargRunOptions,
  validate = true
): Promise<Config> => {
  nconf.argv(yargs.strict().options(yargOptions));
  // user config file from argv overrides default location
  const cliConfigPath = nconf.get(CONFIG_FILE.key);
  const configPath = cliConfigPath || CONFIG_FILE.default;
  if (cliConfigPath && !FS.existsSync(cliConfigPath)) {
    console.error(`Specified config file doesn't exist (${configPath})`);
    process.exit(1);
  }
  if (configPath.endsWith(".json")) {
    nconf.file(configPath);
  } else {
    nconf.file({ file: configPath, format: TOML });
  }

  const configDefaults = makeConfigDefaults();
  nconf.defaults(configDefaults);

  const loadAsync = promisify(nconf.load.bind(nconf));
  await loadAsync();
  const loadedConfig = nconf.get();
  if (validate) {
    const validation = new Validator(loadedConfig, makeConfigValidations());
    if (validation.fails()) {
      console.error("Invalid config");
      const errors = validation.errors.all();
      console.log(formatValidationErrors(errors));
      process.exit(1);
    }
  }

  const asObject = () => {
    const obj = nconf.get();
    const nonConfigKeys = ["_", "$0", "type"];

    const cliAliases = userPrefs
      .map(({ alias }) => alias)
      .flatMap((x) => x)
      .filter((x): x is string => !!x);

    [...nonConfigKeys, ...cliAliases].forEach((alias) => delete obj[alias]);

    return obj;
  };

  const config: Config = {
    get bakerMonitor() {
      return nconf.get(BAKER_GROUP.key) as BakerMonitorConfig;
    },
    get nodeMonitor() {
      return nconf.get(NODE_MONITOR_GROUP.key) as NodeMonitorConfig;
    },
    get logLevel() {
      return nconf.get(LOG_LEVEL.key) as LogLevelDesc;
    },
    get excludedEvents() {
      return nconf.get(EXCLUDED_EVENTS.key) || [];
    },
    get telegram() {
      return nconf.get(TELEGRAM_KEY) as TelegramConfig;
    },
    get email() {
      return nconf.get(EMAIL_KEY) as EmailConfig;
    },
    get desktop() {
      return nconf.get(DESKTOP_KEY) as DesktopConfig;
    },
    get webhook() {
      return nconf.get(WEBHOOK_KEY) as WebhookConfig;
    },
    get slack() {
      return nconf.get(SLACK_KEY) as SlackConfig;
    },
    get notifications() {
      return nconf.get(NOTIFICATIONS_KEY) as NotificationsConfig;
    },
    get storageDirectory() {
      return nconf.get(DATA_DIR.key);
    },
    asObject,
  };
  return config;
};
