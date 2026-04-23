import {
  type WalletAdapter,
  type WalletState,
  initialWalletState,
} from "./types";
import { chainName, normalizeAddress, parseHexChainId, weiHexToEth } from "./utils";

type EthereumProvider = {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on?(event: "accountsChanged" | "chainChanged", listener: (...args: unknown[]) => void): void;
  removeListener?(event: "accountsChanged" | "chainChanged", listener: (...args: unknown[]) => void): void;
  isMetaMask?: boolean;
};

type WindowWithEthereum = Window & { ethereum?: EthereumProvider };

const walletUnavailable = "No browser wallet found. Install MetaMask, Coinbase Wallet, or use the embedded demo wallet.";

function providerName(provider: EthereumProvider) {
  return provider.isMetaMask ? "MetaMask" : "Browser wallet";
}

export function createBrowserWalletAdapter(provider?: EthereumProvider): WalletAdapter {
  let state: WalletState = initialWalletState();
  const listeners = new Set<(s: WalletState) => void>();
  const ethereum =
    provider ?? (typeof window !== "undefined" ? (window as WindowWithEthereum).ethereum : undefined);

  const emit = () => listeners.forEach((listener) => listener(state));
  const set = (next: WalletState | Partial<WalletState>) => {
    state = { ...state, ...next };
    emit();
  };

  const syncIdentity = async (address: `0x${string}` | null) => {
    if (!ethereum || !address) {
      set(initialWalletState());
      return;
    }

    const [chainResult, balanceResult] = await Promise.allSettled([
      ethereum.request({ method: "eth_chainId" }),
      ethereum.request({ method: "eth_getBalance", params: [address, "latest"] }),
    ]);

    const chainId = parseHexChainId(
      chainResult.status === "fulfilled" ? String(chainResult.value) : undefined,
    );
    const balanceEth = balanceResult.status === "fulfilled"
      ? weiHexToEth(String(balanceResult.value))
      : undefined;

    set({
      status: "connected",
      error: undefined,
      identity: {
        address,
        displayName: "",
        ensName: null,
        lensHandle: null,
        worldIdVerified: false,
        chainId,
        chainName: chainName(chainId),
        balanceEth,
        connectorName: providerName(ethereum),
        lastConnectedAt: new Date().toISOString(),
      },
    });
  };

  const handleAccountsChanged = (...args: unknown[]) => {
    const accounts = Array.isArray(args[0]) ? args[0] : [];
    const nextAddress = typeof accounts[0] === "string" ? normalizeAddress(accounts[0]) : null;
    void syncIdentity(nextAddress);
  };

  const handleChainChanged = () => {
    void syncIdentity(state.identity.address);
  };

  ethereum?.on?.("accountsChanged", handleAccountsChanged);
  ethereum?.on?.("chainChanged", handleChainChanged);

  if (ethereum) {
    // Defer eth_accounts until after hydration so the first client snapshot matches SSR (disconnected).
    const schedule = () => {
      void ethereum
        .request({ method: "eth_accounts" })
        .then((accounts) => {
          const list = Array.isArray(accounts) ? accounts : [];
          if (typeof list[0] === "string") void syncIdentity(normalizeAddress(list[0]));
        })
        .catch(() => undefined);
    };
    setTimeout(schedule, 0);
  }

  return {
    id: "browser",
    getSnapshot: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      listener(state);
      return () => listeners.delete(listener);
    },
    connect: async () => {
      if (!ethereum) {
        set({ status: "error", error: walletUnavailable });
        return;
      }

      set({ status: "connecting", error: undefined });
      try {
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        const list = Array.isArray(accounts) ? accounts : [];
        const address = typeof list[0] === "string" ? normalizeAddress(list[0]) : null;
        if (!address) throw new Error("Wallet did not return an account.");
        await syncIdentity(address);
      } catch (error) {
        set({
          status: "error",
          error: error instanceof Error ? error.message : "Wallet connection was rejected.",
        });
      }
    },
    disconnect: async () => {
      set(initialWalletState());
    },
    signMessage: async (message: string) => {
      if (!ethereum || !state.identity.address) {
        throw new Error("Connect a wallet before signing.");
      }

      const signature = await ethereum.request({
        method: "personal_sign",
        params: [message, state.identity.address],
      });

      if (typeof signature !== "string" || !signature.startsWith("0x")) {
        throw new Error("Wallet returned an invalid signature.");
      }

      return signature as `0x${string}`;
    },
  };
}
