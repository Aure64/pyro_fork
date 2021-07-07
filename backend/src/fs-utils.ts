import * as fs from "fs";
import { debug } from "loglevel";
import { dirname } from "path";

const encoding = "utf8";

const datePrefix = "~d:";
const datePrefixLen = datePrefix.length;

function jsonReplacer(this: any, key: any, value: any): any {
  if (this[key] instanceof Date) {
    return `${datePrefix}${value}`;
  }
  return value;
}

function jsonReviver(_key: any, value: any): any {
  if (typeof value === "string" && value.startsWith(datePrefix)) {
    return new Date(value.substring(datePrefixLen));
  }
  return value;
}

export const writeJson = async (fileName: string, value: any): Promise<void> =>
  await fs.promises.writeFile(
    fileName,
    JSON.stringify(value, jsonReplacer),
    encoding
  );

export const readJson = async (fileName: string): Promise<any> =>
  JSON.parse(await fs.promises.readFile(fileName, encoding), jsonReviver);

export const ensureExists = async (
  fileName: string,
  initialValue: any
): Promise<void> => {
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
