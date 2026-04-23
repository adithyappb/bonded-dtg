"use client";

import { Check, Loader2, LogOut, Wallet } from "lucide-react";
import { useAppSignOut } from "@/lib/app-session";
import { cn } from "@/lib/cn";
import { isBaseChain, shortAddress, useWallet } from "@/lib/wallet";

type WalletConnectButtonProps = {
  compact?: boolean;
  className?: string;
  showAddress?: boolean;
};

export function WalletConnectButton({
  compact = false,
  className,
  showAddress = true,
}: WalletConnectButtonProps) {
  const { status, identity, connect } = useWallet();
  const signOut = useAppSignOut();
  const connected = status === "connected" && Boolean(identity.address);
  const connecting = status === "connecting";
  const chainReady = isBaseChain(identity.chainId);
  const label = connected
    ? showAddress && identity.address
      ? identity.displayName || shortAddress(identity.address)
      : "Sign Out"
    : connecting
      ? "Connecting"
      : compact
        ? "Connect"
        : "Connect wallet";

  return (
    <button
      type="button"
      onClick={() => void (connected ? signOut() : connect())}
      disabled={connecting}
      aria-live="polite"
      className={cn(
        "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        connected
          ? "border border-border bg-card/70 text-foreground hover:border-primary/50"
          : "gradient-emerald text-primary-foreground glow-emerald hover:brightness-110",
        compact ? "px-3 py-1.5 text-xs" : "px-4",
        className,
      )}
      title={identity.address ?? undefined}
    >
      {connecting ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : connected ? (
        !showAddress ? <LogOut className="h-4 w-4" aria-hidden /> : chainReady ? <Check className="h-4 w-4" aria-hidden /> : <LogOut className="h-4 w-4" aria-hidden />
      ) : (
        <Wallet className="h-4 w-4" aria-hidden />
      )}
      <span className="max-w-[11rem] truncate">{label}</span>
    </button>
  );
}

