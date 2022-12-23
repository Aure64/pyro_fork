import { URLSearchParams } from "url";

export const E_NETWORK_CONNECTIONS = "network/connections";

export const E_TEZOS_VERSION = "version";

export const E_IS_BOOTSTRAPPED = "chains/main/is_bootstrapped";

export const E_CONSTANTS = (block: string) =>
  `chains/main/blocks/${block}/context/constants`;

export const E_BLOCK = (block: string) => `chains/main/blocks/${block}`;

export const E_BLOCK_HEADER = (block: string) =>
  `chains/main/blocks/${block}/header`;

export const E_BLOCK_HASH = (block: string) =>
  `chains/main/blocks/${block}/hash`;

export const E_BAKING_RIGHTS = (
  block: string,
  params?: Record<string, string>
) => {
  const path = `/chains/main/blocks/${block}/helpers/baking_rights`;
  return `${path}?${new URLSearchParams(params).toString()}`;
};

export const E_ENDORSING_RIGHTS = (
  block: string,
  params?: Record<string, string>
) => {
  const path = `/chains/main/blocks/${block}/helpers/endorsing_rights`;
  return `${path}?${new URLSearchParams(params).toString()}`;
};

export const E_CHAIN_ID = "/chains/main/chain_id";

export const E_DELEGATES_PKH = (block: string, pkh: string) =>
  `chains/main/blocks/${block}/context/delegates/${pkh}`;

export const E_DELEGATE_PARTICIPATION = (block: string, pkh: string) =>
  `chains/main/blocks/${block}/context/delegates/${pkh}/participation`;

export const delegatesUrl = (rpcUrl: string, pkh: string, block: string) => {
  return `${rpcUrl}/${E_DELEGATES_PKH(block, pkh)}`;
};
