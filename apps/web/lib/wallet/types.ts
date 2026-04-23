export type WalletStatus = "disconnected" | "connecting" | "connected" | "error";

export interface WalletIdentity {
  address: `0x${string}` | null;
  displayName: string;
  ensName?: string | null;
  lensHandle?: string | null;
  worldIdVerified: boolean;
  chainId?: number;
  chainName?: string;
  balanceEth?: string;
  connectorName?: string;
  lastConnectedAt?: string;
}

export interface WalletState {
  status: WalletStatus;
  identity: WalletIdentity;
  error?: string;
}

export interface WalletAdapter {
  readonly id: string;
  getSnapshot(): WalletState;
  subscribe(listener: (state: WalletState) => void): () => void;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  signMessage(message: string): Promise<`0x${string}`>;
}

const defaultIdentity = (): WalletIdentity => ({
  address: null,
  displayName: "",
  ensName: null,
  lensHandle: null,
  worldIdVerified: false,
  chainName: undefined,
  balanceEth: undefined,
  connectorName: undefined,
  lastConnectedAt: undefined,
});

export const initialWalletState = (): WalletState => ({
  status: "disconnected",
  identity: defaultIdentity(),
});

/**
 * Single frozen snapshot for `useSyncExternalStore` `getServerSnapshot`.
 * Must stay referentially stable — React forbids allocating a new object per call.
 */
export const SERVER_WALLET_SNAPSHOT: WalletState = Object.freeze({
  status: "disconnected",
  identity: Object.freeze({
    ...defaultIdentity(),
  }),
});
