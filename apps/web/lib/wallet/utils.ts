export const BASE_CHAIN_ID = 8453;

export const SUPPORTED_CHAINS: Record<number, string> = {
  [BASE_CHAIN_ID]: "Base",
  84532: "Base Sepolia",
  1: "Ethereum",
  11155111: "Sepolia",
};

export function normalizeAddress(address: string): `0x${string}` {
  return address.toLowerCase() as `0x${string}`;
}

export function shortAddress(address: string, head = 6, tail = 4) {
  if (address.length <= head + tail) return address;
  return `${address.slice(0, head)}...${address.slice(-tail)}`;
}

export function parseHexChainId(chainId: string | number | undefined): number | undefined {
  if (typeof chainId === "number") return chainId;
  if (!chainId) return undefined;
  return Number.parseInt(chainId, chainId.startsWith("0x") ? 16 : 10);
}

export function chainName(chainId: number | undefined) {
  if (!chainId) return undefined;
  return SUPPORTED_CHAINS[chainId] ?? `Chain ${chainId}`;
}

export function isBaseChain(chainId: number | undefined) {
  return chainId === BASE_CHAIN_ID || chainId === 84532;
}

export function weiHexToEth(balanceHex: string | undefined) {
  if (!balanceHex) return undefined;
  const wei = BigInt(balanceHex);
  const whole = wei / 10n ** 18n;
  const fraction = (wei % 10n ** 18n).toString().padStart(18, "0").slice(0, 4);
  return `${whole}.${fraction}`;
}
