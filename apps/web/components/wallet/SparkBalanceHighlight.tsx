"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { SPARK_NAME, SPARK_TAGLINE, SPARK_TICKER, formatSparkAmount, useSparkBalance } from "@/lib/spark";
import { cn } from "@/lib/cn";

type SparkBalanceHighlightProps = {
  className?: string;
  /** Shorter copy for profile rails. */
  compact?: boolean;
};

export function SparkBalanceHighlight({ className, compact }: SparkBalanceHighlightProps) {
  const balance = useSparkBalance();

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-lg border border-accent/40 bg-card/70 p-6 glow-gold", className)}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/15">
          <Zap className="h-6 w-6 text-accent" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">
            {SPARK_NAME} <span className="font-mono text-[10px] text-accent">({SPARK_TICKER})</span>
          </p>
          <p className="mt-1 text-3xl font-bold text-gradient-gold tabular-nums">{formatSparkAmount(balance)}</p>
        </div>
      </div>
      <p className={cn("mt-4 text-sm leading-relaxed text-muted-foreground", compact && "mt-3 text-xs")}>
        {compact
          ? "Bonded rewards — stacks with USDC stakes, ETH, and Bitcoin-side flows."
          : SPARK_TAGLINE}
      </p>
      {!compact ? (
        <p className="mt-2 text-xs text-muted-foreground/90">
          Works alongside USDC date stakes, ETH in your wallet, and Bitcoin-stack flows — each layer stays separate; Spark
          tracks Bonded-native rewards.
        </p>
      ) : null}
    </motion.div>
  );
}
