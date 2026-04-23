"use client";

import { AppStateProvider } from "@/components/app/AppStateProvider";
import { BitcoinIntegrationProvider } from "@/lib/bitcoin-integration";
import { WalletProvider, type WalletAdapter } from "@/lib/wallet";
import type { ReactNode } from "react";

export function Providers({
  children,
  walletAdapter,
}: {
  children: ReactNode;
  walletAdapter?: WalletAdapter;
}) {
  return (
    <BitcoinIntegrationProvider>
      <WalletProvider adapter={walletAdapter}>
        <AppStateProvider>{children}</AppStateProvider>
      </WalletProvider>
    </BitcoinIntegrationProvider>
  );
}
