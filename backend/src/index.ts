//see https://github.com/yagop/node-telegram-bot-api/issues/319
process.env["NTBA_FIX_319"] = "1";

import * as FS from "fs";
import * as readline from "readline";

import yargs from "yargs";
import * as TOML from "@iarna/toml";

import * as Config from "./config";
import run from "./run";

/**
 * Calls makeConfigFile and writes the result to the specified path.
 */
const writeSampleConfig = (path: string | null | undefined) => {
  const sampleConfig = Config.makeSampleConfig();
  const serialized = TOML.stringify(sampleConfig);
  if (path) {
    FS.writeFileSync(path, serialized);
  } else {
    console.log(serialized);
  }
};

const clearData = (dataDirectory: string) => {
  if (FS.existsSync(dataDirectory)) {
    FS.rmdirSync(dataDirectory, { recursive: true });
    console.log(`Data directory deleted: ${dataDirectory}`);
  } else {
    console.log("Data directory does not exist");
  }
};

const main = async () => {
  yargs(process.argv.slice(2))
    .strict()
    .command("config", "Commands to view and manage configuration", (yargs) => {
      return yargs
        .command(
          "show",
          "Show effective config derived from command line and config file",
          async (yargs) => {
            return yargs.options(Config.yargRunOptions);
          },
          async () => {
            const config = await Config.load();
            const serialized = TOML.stringify(config.asObject());
            console.log(serialized);
          }
        )
        .command(
          "sample [path]",
          "Print sample config or write it to a file",
          (yargs) => {
            return yargs.positional("path", { type: "string" });
          },
          (args) => {
            writeSampleConfig(args.path);
          }
        )
        .demandCommand();
    })
    .command(
      "reset",
      "Clear state data, including notifications queues and block history.",
      async (yargs) => {
        return yargs.options(Config.yargResetOptions).option("force", {
          alias: "f",
          type: "boolean",
          description: "Don't prompt for confirmation, just clear state",
        });
      },
      async (args) => {
        const config = await Config.load(Config.yargResetOptions, false);
        if (args.force) {
          clearData(config.storageDirectory);
        } else {
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
          });

          rl.question(
            `Delete ${config.storageDirectory}?\nEnter y to confirm, anything else to exit: `,
            (answer) => {
              rl.close();
              if (answer === "y") {
                clearData(config.storageDirectory);
              }
            }
          );
        }
      }
    )
    .command(
      "run",
      "Starts event monitoring.",
      async (yargs) => {
        return yargs.options(Config.yargRunOptions);
      },
      async () => {
        const config = await Config.load();
        await run(config);
      }
    )
    .demandCommand().argv;
};

main();
