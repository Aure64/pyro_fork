import * as fs from "fs";
import { debug } from "loglevel";
import { dirname } from "path";

const encoding = "utf8";

export const writeJson = async (fileName: string, value: any) =>
  await fs.promises.writeFile(fileName, JSON.stringify(value), encoding);

export const readJson = async (fileName: string) =>
  JSON.parse(await fs.promises.readFile(fileName, encoding));

export const ensureExists = async (fileName: string, initialValue: any) => {
  try {
    await fs.promises.access(fileName, fs.constants.F_OK);
  } catch (err) {
    debug(
      `File ${fileName} doesn't exist, creating with value ${initialValue}`,
      err
    );
    const dir = dirname(fileName);
    await fs.promises.mkdir(dir, { recursive: true });
    await writeJson(fileName, initialValue);
  }
};
