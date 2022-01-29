export const E_NETWORK_CONNECTIONS = "network/connections";
export const E_TEZOS_VERSION = "version";
export const E_IS_BOOTSTRAPPED = "chains/main/is_bootstrapped";
export const E_CONSTANTS = (block: string) =>
  `chains/main/blocks/${block}/context/constants`;
export const E_DELEGATES_PKH = (block: string, pkh: string) =>
  `chains/main/blocks/${block}/context/delegates/${pkh}`;

export const E_BLOCK = (block: string) => `chains/main/blocks/${block}`;
export const E_BLOCK_HEADER = (block: string) =>
  `chains/main/blocks/${block}/header`;

export const delegatesUrl = (rpcUrl: string, pkh: string, block: string) => {
  return `${rpcUrl}/${E_DELEGATES_PKH(block, pkh)}`;
};
