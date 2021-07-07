import { setWith, clone } from "lodash";

const setPath = <T>(
  path: string,
  data: Record<string, T>,
  value: unknown
): Record<string, T> => {
  const objectPath = path.split(":");
  return setWith(clone(data), objectPath, value, clone);
};

export default setPath;
