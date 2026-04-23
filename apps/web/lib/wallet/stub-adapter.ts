import { type WalletAdapter, type WalletState, initialWalletState } from "./types";
import { chainName } from "./utils";

export function createStubWalletAdapter(): WalletAdapter {
  let state: WalletState = initialWalletState();
  const listeners = new Set<(s: WalletState) => void>();

  const emit = () => {
    listeners.forEach((fn) => fn(state));
  };

  const set = (next: Partial<WalletState> | WalletState) => {
    state = { ...state, ...next } as WalletState;
    emit();
  };

  return {
    id: "stub",
    getSnapshot: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      listener(state);
      return () => listeners.delete(listener);
    },
    connect: async () => {
      set({ status: "connecting", error: undefined });
      await new Promise((r) => setTimeout(r, 400));
      set({
        status: "connected",
        identity: {
          address: "0x1234567890123456789012345678901234567890",
          displayName: "adithya.vouch",
          ensName: "adithya.vouch",
          lensHandle: "@adithya",
          worldIdVerified: true,
          chainId: 8453,
          chainName: chainName(8453),
          balanceEth: "1.2450",
          connectorName: "Demo wallet",
          lastConnectedAt: new Date().toISOString(),
        },
      });
    },
    disconnect: async () => {
      set(initialWalletState());
    },
    signMessage: async (message: string) => {
      const enc = new TextEncoder().encode(message);
      const digest = new Uint8Array(32);
      for (let i = 0; i < enc.length; i++) digest[i % 32]! ^= enc[i]!;
      const hex = Array.from(digest, (b) => b.toString(16).padStart(2, "0")).join("");
      return `0x${hex}` as `0x${string}`;
    },
  };
}
