import { setWith, clone } from "lodash";

const setPath = (path: string, data: object, value: unknown): object => {
  const objectPath = path.split(":");
  return setWith(clone(data), objectPath, value, clone);
};

export default setPath;
