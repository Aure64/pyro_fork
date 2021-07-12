//see https://github.com/yagop/node-telegram-bot-api/issues/319
process.env["NTBA_FIX_319"] = "1";

import * as FS from "fs";

import envPaths from "env-paths";
import * as yargs from "yargs";
import * as TOML from "@iarna/toml";

import * as Config from "./config";
import run from "./run";

/**
 * Calls makeConfigFile and writes the result to the specified path.
 */
const writeSampleConfig = (path: string | null) => {
  console.log(`Creating User Config file at ${path}`);
  console.log(
    "Note: config has invalid placeholder data that must be replaced before this config can be used."
  );
  const sampleConfig = Config.makeConfigFile();
  const serialized = TOML.stringify(sampleConfig);
  if (path) {
    FS.writeFileSync(path, serialized);
  } else {
    console.log(serialized);
  }
};

type ClearDataArgs = {
  dataDirectory: string;
};

const clearData = ({ dataDirectory }: ClearDataArgs) => {
  if (FS.existsSync(dataDirectory)) {
    FS.rmdirSync(dataDirectory, { recursive: true });
    console.log(`Data directory deleted: ${dataDirectory}`);
  } else {
    console.log("Data directory does not exist");
  }
};

const main = async () => {
  const { data: dataDirectory, config: configDirectory } = envPaths(
    "pyrometer",
    { suffix: "" }
  );

  console.log("Data directory:", dataDirectory);
  console.log("Config directory:", configDirectory);

  FS.mkdirSync(dataDirectory, { recursive: true });
  FS.mkdirSync(configDirectory, { recursive: true });

  yargs(process.argv.slice(2))
    .strict()
    .command("config", "Commands to view and manage configuration", (yargs) => {
      return yargs
        .command(
          "show",
          "Show effective config derived from command line and config file",
          async (yargs) => {
            return yargs.options(Config.yargOptions);
          },
          async () => {
            const config = await Config.load(dataDirectory, configDirectory);
            const serialized = TOML.stringify(config.asObject());
            console.log(serialized);
          }
        )
        .command(
          "sample [path]",
          "Print sample config or write it to a file",
          () => {},
          ({ path }: { path: string }) => {
            writeSampleConfig(path);
          }
        )
        .demandCommand();
    })
    .command(
      "clear-data",
      "Deletes all system data, including job queues and block history.",
      () => {
        /* not used.  See more at https://github.com/yargs/yargs/blob/master/docs/api.md#command */
      },
      () => {
        clearData({ dataDirectory });
      }
    )
    .command(
      "run",
      "Starts event monitoring.",
      async (yargs) => {
        return yargs.options(Config.yargOptions);
      },
      async () => {
        const config = await Config.load(dataDirectory, configDirectory);
        await run(config);
      }
    ).argv;
};

main();
