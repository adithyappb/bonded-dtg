"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Timer,
  QrCode,
  ShieldCheck,
  Sparkles,
  Bitcoin,
  Flame,
} from "lucide-react";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { StakeCard } from "@/components/vouch/StakeCard";
import { ReputationBadge } from "@/components/vouch/ReputationBadge";
import { useBitcoinIntegration } from "@/lib/bitcoin-integration";
import { DEMO_STAKES } from "@/lib/demo-data";
import { useGhostScore } from "@/lib/ghost-score";
import { useTrustProfile } from "@/lib/hooks/useTrustProfile";
import { useActiveStake } from "@/lib/hooks/useStake";
import { trustTierLabel } from "@/lib/trust";
import { DEFAULT_MATCH } from "@/lib/matching";
import { routes } from "@/lib/routes";
import { formatSparkAmount, useSparkBalance } from "@/lib/spark";
import { formatUsdc, FULL_ESCROW_USDC, STAKE_PER_SIDE_USDC } from "@/lib/stake";

export default function DashboardPage() {
  const topMatch = DEFAULT_MATCH;
  const { mode } = useBitcoinIntegration();
  const stackLabel = mode === "nunchuk" ? "Nunchuk multisig" : "Cogcoin sync";
  const ghostScore = useGhostScore();
  const sparkBalance = useSparkBalance();
  const trust = useTrustProfile();
  const activeStake = useActiveStake();
  const activeEscrowLabel =
    activeStake?.status === "locked"
      ? formatUsdc(FULL_ESCROW_USDC)
      : activeStake?.status === "awaiting_peer"
        ? `${formatUsdc(STAKE_PER_SIDE_USDC)} · waiting on peer`
        : activeStake
          ? formatUsdc(activeStake.totalLocked)
          : formatUsdc(FULL_ESCROW_USDC);

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Commitment Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Escrow on Base, ranked matches, and reputation that rewards follow-through.</p>
          </div>
          <WalletConnectButton showAddress />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
          className="glass-card mt-6 flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/10">
              <Bitcoin className="h-5 w-5 text-accent" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Bitcoin stack</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                Active pipeline: <span className="text-accent">{stackLabel}</span>
              </p>
              <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">
                Same toggle as Wallet — run Nunchuk PSBT flows or Cogcoin identity sync without leaving Bonded.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Link
              href={`${routes.wallet}#bitcoin-stack`}
              className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background/50 px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              Configure <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href={routes.discover}
              className="gradient-emerald inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20"
            >
              <Flame className="h-4 w-4" aria-hidden />
              Discover
            </Link>
          </div>
        </motion.div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="glass-card flex flex-col justify-between gap-4 rounded-2xl p-5 md:flex-row md:items-center">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Active stake</p>
              <p className="mt-1 font-heading text-2xl font-bold text-foreground">{activeEscrowLabel}</p>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Timer className="w-4 h-4" /> Check-in window active
              </p>
            </div>
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary"
            >
              <QrCode className="w-5 h-5 text-primary" />
              <span>Show QR at venue</span>
            </button>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Next best action</p>
                <p className="mt-1 text-sm font-semibold text-foreground">Confirm venue and keep chat on-chain ready.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {[
            { icon: Wallet, label: "Total Staked", value: "$450 USDC", change: "+12%", up: true },
            { icon: TrendingUp, label: "Dates Completed", value: "14", change: "+3", up: true },
            { icon: Zap, label: "Spark earned", value: formatSparkAmount(sparkBalance), change: "+180", up: true },
            { icon: Wallet, label: "Forfeited stakes", value: "1", change: `-$${STAKE_PER_SIDE_USDC}`, up: false },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card rounded-2xl p-5"
            >
              <div className="flex items-center justify-between">
                <stat.icon className="w-5 h-5 text-muted-foreground" />
                <span
                  className={`flex items-center gap-0.5 text-xs font-medium ${stat.up ? "text-primary" : "text-destructive"}`}
                >
                  {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </span>
              </div>
              <p className="font-heading font-bold text-2xl mt-3 text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_20rem]">
          <div>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-4">Reputation</h2>
            <div className="grid grid-cols-3 gap-4">
              <ReputationBadge
                score={trust.score}
                label="Trust"
                type="trust"
                caption={trustTierLabel(trust.tier)}
              />
              <ReputationBadge score={ghostScore} label="Ghost" type="ghost" />
              <ReputationBadge score={14} label="Streak" type="streak" />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{trust.summary}</p>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 text-accent">
              <Sparkles className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em]">Top recommendation</p>
            </div>
            <h3 className="mt-3 font-heading text-xl font-semibold text-foreground">
              {topMatch.profile.name}, {topMatch.profile.age}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{topMatch.profile.location}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent">
                {topMatch.score}% fit
              </span>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                {topMatch.profile.intent}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-secondary-foreground">{topMatch.reasons[0]?.detail}</p>
            <Link
              href={routes.discover}
              className="gradient-emerald mt-5 inline-flex rounded-lg px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Open discover
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="font-heading text-xl font-semibold text-foreground mb-4">Stake history</h2>
          <div className="space-y-3">
            {DEMO_STAKES.map((stake) => (
              <StakeCard key={stake.matchName + stake.date} {...stake} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
