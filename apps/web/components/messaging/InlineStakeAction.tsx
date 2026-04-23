"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Lock } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type StakeActionPhase = "proposal" | "confirming" | "yourSideLocked";

export function InlineStakeAction({
  title,
  amountLabel,
  onAccept,
}: {
  title: string;
  amountLabel: string;
  onAccept?: () => void;
}) {
  const [phase, setPhase] = useState<StakeActionPhase>("proposal");

  useEffect(() => {
    if (phase !== "confirming") return;
    const t = window.setTimeout(() => {
      setPhase("yourSideLocked");
    }, 900);
    return () => window.clearTimeout(t);
  }, [phase]);

  const handleAccept = useCallback(() => {
    if (phase !== "proposal") return;
    setPhase("confirming");
    onAccept?.();
  }, [phase, onAccept]);

  const label =
    phase === "proposal"
      ? `Accept & stake ${amountLabel}`
      : phase === "confirming"
        ? "Locking escrow…"
        : "Your side staked · waiting for them";

  const subline =
    phase === "yourSideLocked"
      ? "They still need to confirm on-chain. You will get a ping when both stakes are live."
      : "Base L2 / USDC escrow / mutual release via QR check-in";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[85%] rounded-lg border border-primary/40 bg-primary/5 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg gradient-emerald">
          {phase === "yourSideLocked" ? (
            <CheckCircle2 className="h-5 w-5 text-primary-foreground" aria-hidden />
          ) : phase === "confirming" ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary-foreground" aria-hidden />
          ) : (
            <Lock className="h-5 w-5 text-primary-foreground" aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-heading text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{subline}</p>
          <button
            type="button"
            onClick={handleAccept}
            disabled={phase !== "proposal"}
            aria-busy={phase === "confirming"}
            className={cn(
              "mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-heading font-semibold transition-colors",
              phase === "proposal" && "gradient-emerald text-primary-foreground glow-emerald hover:brightness-110",
              phase === "confirming" &&
                "cursor-wait border border-border bg-secondary/80 text-foreground",
              phase === "yourSideLocked" &&
                "cursor-default border border-primary/35 bg-primary/10 text-primary",
            )}
          >
            {phase === "confirming" ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden />
            ) : null}
            <span className="text-center leading-snug">{label}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
