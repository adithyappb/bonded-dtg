"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createBrowserWalletAdapter } from "./browser-adapter";
import { initialWalletState, SERVER_WALLET_SNAPSHOT, type WalletAdapter, type WalletState } from "./types";

const noopSubscribe = () => () => {};

const WalletContext = createContext<{
  adapter: WalletAdapter;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signMessage: (msg: string) => Promise<`0x${string}`>;
} | null>(null);

export interface WalletProviderProps {
  children: ReactNode;
  adapter?: WalletAdapter;
}

export function WalletProvider({ children, adapter: adapterProp }: WalletProviderProps) {
  const adapter = useMemo(
    () => adapterProp ?? createBrowserWalletAdapter(),
    [adapterProp],
  );

  const connect = useCallback(() => adapter.connect(), [adapter]);
  const disconnect = useCallback(() => adapter.disconnect(), [adapter]);
  const signMessage = useCallback(
    (msg: string) => adapter.signMessage(msg),
    [adapter],
  );

  const value = useMemo(
    () => ({ adapter, connect, disconnect, signMessage }),
    [adapter, connect, disconnect, signMessage],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletState & {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signMessage: (msg: string) => Promise<`0x${string}`>;
  ready: boolean;
} {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within WalletProvider");
  }

  const state = useSyncExternalStore(
    ctx.adapter.subscribe,
    () => ctx.adapter.getSnapshot(),
    () => SERVER_WALLET_SNAPSHOT,
  );

  return {
    ...state,
    connect: ctx.connect,
    disconnect: ctx.disconnect,
    signMessage: ctx.signMessage,
    ready: true,
  };
}

export function useWalletOptional():
  | (WalletState & {
      connect: () => Promise<void>;
      disconnect: () => Promise<void>;
      signMessage: (msg: string) => Promise<`0x${string}`>;
      ready: boolean;
    })
  | null {
  const ctx = useContext(WalletContext);

  const state = useSyncExternalStore(
    ctx ? ctx.adapter.subscribe : noopSubscribe,
    () => (ctx ? ctx.adapter.getSnapshot() : initialWalletState()),
    () => SERVER_WALLET_SNAPSHOT,
  );

  if (!ctx) return null;

  return {
    ...state,
    connect: ctx.connect,
    disconnect: ctx.disconnect,
    signMessage: ctx.signMessage,
    ready: true,
  };
}
