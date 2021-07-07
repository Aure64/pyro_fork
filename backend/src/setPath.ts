import * as R from "ramda";

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

export default setPath;
