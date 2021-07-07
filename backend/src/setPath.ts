import { setWith, clone } from "lodash";

const setPath = (
  path: string,
  data: Record<string, any>,
  value: unknown
): Record<string, any> => {
  const objectPath = path.split(":");
  return setWith(clone(data), objectPath, value, clone);
};

export default setPath;
