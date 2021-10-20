import { NodeInfoCollection } from "../nodeMonitor";
import { BakerInfoCollection } from "../bakerMonitor";
import { RpcClient } from "@taquito/rpc";

export interface Context {
  nodeInfoCollection: NodeInfoCollection;
  bakerInfoCollection: BakerInfoCollection;
  rpc: RpcClient;
}

export const createContext = (
  nodeInfoCollection: NodeInfoCollection,
  bakerInfoCollection: BakerInfoCollection,
  rpcUrl: string
) => {
  return {
    nodeInfoCollection,
    bakerInfoCollection,
    rpc: new RpcClient(rpcUrl),
  };
};
