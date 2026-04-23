"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useHydrated } from "@/lib/hooks/useHydrated";

export type BitcoinIntegrationMode = "nunchuk" | "cogcoin";

const STORAGE_KEY = "bonded:bitcoin-integration";

/** Curated official / project links for developers (no invented API base URLs). */
export const BITCOIN_DEV_RESOURCES = {
  bitcoinCore: "https://bitcoincore.org/",
  bitcoinDeveloperDocs: "https://developer.bitcoin.org/",
  learnMeABitcoin: "https://learnmeabitcoin.com/",
  lightningEngineeringApi: "https://lightning.engineering/api-docs/",
  lnd: "https://github.com/lightningnetwork/lnd",
  lnbits: "https://lnbits.com/",
  voltage: "https://voltage.cloud/",
  rustBitcoin: "https://github.com/rust-bitcoin/rust-bitcoin",
  bitcoinjsLib: "https://github.com/bitcoinjs/bitcoinjs-lib",
  pythonBitcoinlib: "https://github.com/petertodd/python-bitcoinlib",
  mutinyNet: "https://mutinynet.com/",
  polar: "https://lightningpolar.com/",
  cogcoinOrg: "https://cogcoin.org/",
  cogcoinWhitepaper: "https://cogcoin.org/whitepaper.md",
} as const;

export const NUNCHUK_CLI_HINT =
  "npm run nunchuk -- tx sign --wallet <id> --tx-id <id> --fingerprint <xfp>";

export const COGCOIN_CLI_HINT = "npm run cogcoin -- sync";

type BitcoinIntegrationContextValue = {
  mode: BitcoinIntegrationMode;
  setMode: (mode: BitcoinIntegrationMode) => void;
};

const BitcoinIntegrationContext = createContext<BitcoinIntegrationContextValue | null>(null);

const listeners = new Set<() => void>();

function parseMode(raw: string | null): BitcoinIntegrationMode {
  return raw === "cogcoin" ? "cogcoin" : "nunchuk";
}

function defaultFromEnv(): BitcoinIntegrationMode {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_DEFAULT_BITCOIN_STACK === "cogcoin") {
    return "cogcoin";
  }
  return "nunchuk";
}

function readStoredMode(): BitcoinIntegrationMode {
  if (typeof window === "undefined") return defaultFromEnv();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return defaultFromEnv();
    return parseMode(raw);
  } catch {
    return defaultFromEnv();
  }
}

function subscribeStore(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getServerSnapshot(): BitcoinIntegrationMode {
  return defaultFromEnv();
}

function emit() {
  listeners.forEach((l) => l());
}

function persistMode(next: BitcoinIntegrationMode) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* quota / private mode */
  }
  emit();
}

export function BitcoinIntegrationProvider({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const mode = useSyncExternalStore(
    subscribeStore,
    () => (hydrated ? readStoredMode() : defaultFromEnv()),
    getServerSnapshot,
  );

  const setMode = useCallback((next: BitcoinIntegrationMode) => {
    persistMode(next);
  }, []);

  const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);

  return (
    <BitcoinIntegrationContext.Provider value={value}>{children}</BitcoinIntegrationContext.Provider>
  );
}

export function useBitcoinIntegration(): BitcoinIntegrationContextValue {
  const ctx = useContext(BitcoinIntegrationContext);
  if (!ctx) {
    throw new Error("useBitcoinIntegration must be used within BitcoinIntegrationProvider");
  }
  return ctx;
}

/** Test helper: read storage key used for persistence. */
export function __bitcoinIntegrationStorageKey(): string {
  return STORAGE_KEY;
}
