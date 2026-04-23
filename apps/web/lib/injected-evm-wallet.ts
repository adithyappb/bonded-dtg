import { getChain, isEvmAddress } from "@/lib/contracts";

type Eip1193Provider = {
  request: <T = unknown>(args: { method: string; params?: unknown[] | Record<string, unknown> }) => Promise<T>;
};

type WindowWithEthereum = Window & { ethereum?: Eip1193Provider };

/** API-issued session used with `@bonded-project/api` (NFT / ETH payment intents). Separate from in-app Nunchuk wallet. */
export type ApiWalletSession = {
  token: string;
  expiresAt: string;
  address: string;
  chainId: number;
  userId?: string;
  walletId?: string;
};

export const apiWalletSessionStorageKey = "bonded.apiWalletSession";

export function normalizeAddressInput(value: string): string {
  return value.trim();
}

export function validateClientWallet(value: string): string | null {
  const address = normalizeAddressInput(value);
  if (!address) {
    return "Enter the user wallet address from the client.";
  }
  if (!isEvmAddress(address)) {
    return "Use a valid EVM address beginning with 0x and containing 40 hex characters.";
  }
  return null;
}

export function readApiWalletSession(): ApiWalletSession | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(apiWalletSessionStorageKey);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as ApiWalletSession;
  } catch {
    window.localStorage.removeItem(apiWalletSessionStorageKey);
    return null;
  }
}

export function writeApiWalletSession(session: ApiWalletSession): void {
  window.localStorage.setItem(apiWalletSessionStorageKey, JSON.stringify(session));
}

export function clearApiWalletSession(): void {
  window.localStorage.removeItem(apiWalletSessionStorageKey);
}

export function getInjectedWalletProvider(): Eip1193Provider | null {
  if (typeof window === "undefined") {
    return null;
  }
  return (window as WindowWithEthereum).ethereum ?? null;
}

export async function requestInjectedWallet(chainId: number): Promise<{ address: string; chainId: number }> {
  const provider = getInjectedWalletProvider();
  if (!provider) {
    throw new Error("Install a browser wallet extension (MetaMask, Coinbase Wallet, Rabby, …) or open the in-app browser.");
  }
  await switchInjectedWalletChain(provider, chainId);
  const accounts = await provider.request<string[]>({ method: "eth_requestAccounts" });
  const address = accounts[0];
  if (!address || !isEvmAddress(address)) {
    throw new Error("Wallet did not return a valid Ethereum address.");
  }
  const activeChainHex = await provider.request<string>({ method: "eth_chainId" });
  return {
    address,
    chainId: Number.parseInt(activeChainHex, 16),
  };
}

export async function signInjectedWalletMessage(address: string, message: string): Promise<string> {
  const provider = getInjectedWalletProvider();
  if (!provider) {
    throw new Error("No EVM wallet provider is available.");
  }
  return provider.request<string>({
    method: "personal_sign",
    params: [message, address],
  });
}

export async function sendInjectedWalletTransaction(input: {
  chainId: number;
  from: string;
  to: string;
  valueWei?: string;
  data?: string;
}): Promise<string> {
  const provider = getInjectedWalletProvider();
  if (!provider) {
    throw new Error("No EVM wallet provider is available for this transaction.");
  }
  await switchInjectedWalletChain(provider, input.chainId);
  return provider.request<string>({
    method: "eth_sendTransaction",
    params: [
      {
        from: input.from,
        to: input.to,
        value: `0x${BigInt(input.valueWei ?? "0").toString(16)}`,
        data: input.data,
      },
    ],
  });
}

async function switchInjectedWalletChain(provider: Eip1193Provider, chainId: number): Promise<void> {
  const chain = getChain(chainId);
  const chainIdHex = `0x${chain.chainId.toString(16)}`;
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? Number((error as { code?: number }).code) : undefined;
    if (code !== 4902) {
      throw error;
    }
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: chainIdHex,
          chainName: chain.name,
          nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          rpcUrls: [chain.rpcUrl],
          blockExplorerUrls: [chain.explorerUrl],
        },
      ],
    });
  }
}
