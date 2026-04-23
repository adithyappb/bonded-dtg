export type SupportedChain = {
  chainId: number;
  name: string;
  label: string;
  explorerUrl: string;
  rpcUrl: string;
  currency: "ETH";
};

export const supportedChains: SupportedChain[] = [
  {
    chainId: 84532,
    name: "Base Sepolia",
    label: "Base Sepolia testnet",
    explorerUrl: "https://sepolia.basescan.org",
    rpcUrl: "https://sepolia.base.org",
    currency: "ETH",
  },
  {
    chainId: 8453,
    name: "Base",
    label: "Base mainnet",
    explorerUrl: "https://basescan.org",
    rpcUrl: "https://mainnet.base.org",
    currency: "ETH",
  },
  {
    chainId: 11155111,
    name: "Ethereum Sepolia",
    label: "Ethereum Sepolia testnet",
    explorerUrl: "https://sepolia.etherscan.io",
    rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
    currency: "ETH",
  },
];

export function getChain(chainId: number): SupportedChain {
  return supportedChains.find((chain) => chain.chainId === chainId) ?? supportedChains[0];
}

export function explorerAddressUrl(chainId: number, address: string): string {
  return `${getChain(chainId).explorerUrl}/address/${address}`;
}

export function explorerTransactionUrl(chainId: number, hash: string): string {
  return `${getChain(chainId).explorerUrl}/tx/${hash}`;
}

export function shortenAddress(address: string): string {
  return address.length > 12 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;
}

export function isEvmAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim());
}
