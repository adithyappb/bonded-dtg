"use client";

import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { setWalletSignalSharing, useWalletSignalSharing } from "@/lib/wallet-signal-preference";
import { useWallet } from "@/lib/wallet";

export function WalletValueOptIn({ className }: { className?: string }) {
  const { status, identity } = useWallet();
  const enabled = useWalletSignalSharing();
  const connected = status === "connected" && Boolean(identity.address);

  return (
    <section className={cn("rounded-lg border border-border/60 bg-card/60 p-5", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
            Wallet signal
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Share a private balance signal with matches only when you choose it. Your exact wallet value stays hidden.
          </p>
          {enabled && connected && identity.balanceEth ? (
            <p className="mt-2 font-mono text-xs text-primary">Signal active from {identity.balanceEth} ETH</p>
          ) : enabled ? (
            <p className="mt-2 text-xs text-primary">Signal on — matches see a coarse tier, not your balance.</p>
          ) : null}
        </div>
        <button
          type="button"
          disabled={!connected}
          onClick={() => setWalletSignalSharing(!enabled)}
          className={cn(
            "inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            enabled
              ? "border border-primary/60 bg-primary/10 text-primary"
              : "border border-border bg-background/60 text-foreground hover:border-primary/50",
          )}
        >
          {enabled ? <Eye className="h-4 w-4" aria-hidden /> : <EyeOff className="h-4 w-4" aria-hidden />}
          {enabled ? "Sharing" : "Keep private"}
        </button>
      </div>
    </section>
  );
}
