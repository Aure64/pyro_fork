import { NodeInfoCollection } from "../nodeMonitor";

export interface Context {
  nodeInfoCollection: NodeInfoCollection;
}

export const createContext = (nodeInfoCollection: NodeInfoCollection) => {
  return { nodeInfoCollection };
};
