"use client";

import { useCallback, useEffect, useState } from "react";
import { Link2, Loader2 } from "lucide-react";
import { apiClient, ApiClientError } from "@/lib/api-client";
import {
  clearApiWalletSession,
  readApiWalletSession,
  requestInjectedWallet,
  writeApiWalletSession,
} from "@/lib/injected-evm-wallet";

const DEFAULT_API_CHAIN = 84532;

export function ApiWalletSessionPanel() {
  const [session, setSession] = useState<ReturnType<typeof readApiWalletSession>>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setSession(readApiWalletSession());
  }, []);

  const devLogin = useCallback(async () => {
    setBusy(true);
    setMsg(null);
    try {
      const { address, chainId } = await requestInjectedWallet(DEFAULT_API_CHAIN);
      const login = await apiClient.devLogin(address, chainId);
      writeApiWalletSession({
        token: login.token,
        expiresAt: login.expiresAt,
        address: login.wallet.address,
        chainId: login.wallet.chainId,
        userId: login.user.id,
        walletId: login.wallet.id,
      });
      setSession(readApiWalletSession());
      setMsg("API session ready. NFT and ETH payment buttons can call the backend.");
    } catch (e) {
      if (e instanceof ApiClientError) {
        setMsg(e.message);
      } else {
        setMsg(e instanceof Error ? e.message : "Could not reach API or wallet.");
      }
    } finally {
      setBusy(false);
    }
  }, []);

  const signOutApi = useCallback(() => {
    clearApiWalletSession();
    setSession(null);
    setMsg("Cleared API wallet session.");
  }, []);

  return (
    <div className="rounded-lg border border-primary/25 bg-primary/5 p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15">
          <Link2 className="h-5 w-5 text-primary" aria-hidden />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Browser wallet → API session</h2>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            In-app Nunchuk connection powers the Bonded demo shell. For{" "}
            <strong className="text-foreground">NFT mints and ETH payment intents</strong>, start{" "}
            <code className="text-xs text-primary">npm run dev:api</code> then link an injected EVM wallet here (MetaMask,
            Coinbase extension, …) using dev-login on Base Sepolia.
          </p>
        </div>
      </div>

      {session ? (
        <div className="rounded-lg border border-border/60 bg-background/50 p-4 text-sm">
          <p className="font-mono text-foreground break-all">{session.address}</p>
          <p className="mt-1 text-muted-foreground">Chain {session.chainId}</p>
          <button
            type="button"
            onClick={signOutApi}
            className="mt-3 text-xs font-semibold text-destructive hover:underline"
          >
            Clear API session
          </button>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void devLogin()}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg gradient-emerald px-4 text-sm font-semibold text-primary-foreground glow-emerald disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          {busy ? "Connecting…" : "Link injected wallet (dev-login)"}
        </button>
      </div>

      {msg ? <p className="text-sm text-muted-foreground">{msg}</p> : null}
    </div>
  );
}
