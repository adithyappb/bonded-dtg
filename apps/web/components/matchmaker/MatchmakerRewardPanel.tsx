"use client";

import { motion } from "framer-motion";
import { Coins, Sparkles, Users } from "lucide-react";
import { CuratedCandidateList } from "@/components/matchmaker/CuratedCandidateList";
import {
  MATCHMAKER_SPARK_MAX,
  MATCHMAKER_USDC_SUCCESS_FEE_PCT,
  MUTUAL_FIT_SCALE,
} from "@/lib/matchmaker";
import { formatSparkAmount, useSparkBalance } from "@/lib/spark";

export function MatchmakerRewardPanel() {
  const spark = useSparkBalance();

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-heading font-semibold text-foreground">Mutual-preference intros</p>
            <p className="text-xs text-muted-foreground">
              We only suggest pairs where both people fit each other’s stated filters. Your upside is
              proportional to mutual fit: lower fit means lower SPARK and fees, and modeled odds of a
              profitable completion drop sharply.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border/50 bg-background/50 p-4 flex gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Spark (primary)
              </p>
              <p className="text-sm text-foreground mt-1">
                Up to {MATCHMAKER_SPARK_MAX} SPARK when mutual fit is ~{MUTUAL_FIT_SCALE}%; scales linearly
                down with fit (app-native demo).
              </p>
              <p className="text-xs text-muted-foreground mt-2">Your balance: {formatSparkAmount(spark)}</p>
            </div>
          </div>
          <div className="rounded-lg border border-border/50 bg-background/50 p-4 flex gap-3">
            <Coins className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                USDC + NFT
              </p>
              <p className="text-sm text-foreground mt-1">
                On mainnet, success-fee % on completed staked dates scales with the same mutual-fit
                proportion (max {MATCHMAKER_USDC_SUCCESS_FEE_PCT}% at perfect fit). “Cupid’s Ledger” mints
                when your first intro credits.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">Suggested pairs</h2>
        <CuratedCandidateList />
      </section>
    </div>
  );
}
