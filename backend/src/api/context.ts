import { NodeInfoCollection } from "../nodeMonitor";
import { BakerInfoCollection } from "../bakerMonitor";
import client, { RpcClient } from "../rpc/client";

export interface Context {
  nodeInfoCollection: NodeInfoCollection;
  bakerInfoCollection: BakerInfoCollection;
  rpc: RpcClient;
  explorerUrl: string | undefined;
}

export const createContext = (
  nodeInfoCollection: NodeInfoCollection,
  bakerInfoCollection: BakerInfoCollection,
  rpcUrl: string,
  explorerUrl: string | undefined
) => {
  return {
    nodeInfoCollection,
    bakerInfoCollection,
    rpc: client(rpcUrl),
    explorerUrl,
  };
};
