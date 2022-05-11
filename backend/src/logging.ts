import { setLevel } from "loglevel";
import loglevel, { LogLevelDesc } from "loglevel";
import * as prefix from "loglevel-plugin-prefix";
import { format } from "date-fns";
import Chalk from "chalk";

export type LoggingConfig = {
  level: LogLevelDesc;
  timestamp: boolean;
} & { [key: string]: { level: LogLevelDesc } };

export const setup = (config: LoggingConfig) => {
  console.log("Logging config", config);

  const colors: Record<string, Chalk.Chalk> = {
    TRACE: Chalk.magenta,
    DEBUG: Chalk.cyan,
    INFO: Chalk.blue,
    WARN: Chalk.yellow,
    ERROR: Chalk.red,
  };
  const colorizeLevel = (level: string): string => {
    const color = colors[level.toUpperCase()] || Chalk.black;
    return color(level[0]);
  };

  // Register prefix plug with loglevel.  This adds timestamp and level to logs.
  const logger = loglevel.noConflict();
  prefix.reg(logger);
  if (config.timestamp) {
    const timestampFormatter = (date: Date) =>
      format(date, "yyyy-MM-dd H:mm:ss");
    prefix.apply(logger, { timestampFormatter });
  }
  // colorize output
  prefix.apply(loglevel, {
    format(level, name, timestamp) {
      return `${
        config.timestamp ? Chalk.gray(`${timestamp}`) + " " : ""
      }${colorizeLevel(level)} [${name}]`;
    },
  });

  for (const key in config) {
    const subLoggerConf = config[key];
    if (subLoggerConf.level) {
      loglevel.getLogger(key).setLevel(subLoggerConf.level);
    }
  }

  setLevel(config.level);
};
