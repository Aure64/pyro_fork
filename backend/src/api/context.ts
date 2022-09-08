import { NodeInfoCollection } from "../nodeMonitor";
import { BakerInfoCollection } from "../bakerMonitor";
import client, { RpcClient, RpcClientConfig } from "../rpc/client";

export interface Context {
  nodeInfoCollection: NodeInfoCollection;
  bakerInfoCollection: BakerInfoCollection;
  rpc: RpcClient;
  explorerUrl: string | undefined;
  showSystemInfo: boolean | undefined;
}

export const createContext = (
  nodeInfoCollection: NodeInfoCollection,
  bakerInfoCollection: BakerInfoCollection,
  rpcUrl: string,
  rpcConfig: RpcClientConfig,
  explorerUrl: string | undefined,
  showSystemInfo: boolean | undefined
) => {
  return {
    nodeInfoCollection,
    bakerInfoCollection,
    rpc: client(rpcUrl, rpcConfig),
    explorerUrl,
    showSystemInfo,
  };
};
