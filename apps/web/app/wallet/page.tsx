"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowUpRight,
  Gift,
  LockKeyhole,
  ShieldCheck,
  Trophy,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { BitcoinStackPanel } from "@/components/integrations/BitcoinStackPanel";
import { ApiWalletSessionPanel } from "@/components/wallet/ApiWalletSessionPanel";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { WalletValueOptIn } from "@/components/wallet/WalletValueOptIn";
import { SparkBalanceHighlight } from "@/components/wallet/SparkBalanceHighlight";
import { DEMO_LEADERBOARD } from "@/lib/demo-data";
import { routes } from "@/lib/routes";
import { DEMO_SPARK_BALANCE, formatSparkAmount, useSparkBalance } from "@/lib/spark";
import { formatUsdc, FULL_ESCROW_USDC } from "@/lib/stake";
import { isBaseChain, shortAddress, useWallet } from "@/lib/wallet";

const walletActions = [
  { label: "Fund date stake", value: formatUsdc(FULL_ESCROW_USDC), detail: "Escrow ready", icon: LockKeyhole },
  { label: "Claim rewards", value: formatSparkAmount(DEMO_SPARK_BALANCE), detail: "Spark available", icon: Gift },
  { label: "Reputation proof", value: "92 Trust", detail: "Wallet-bound", icon: ShieldCheck },
] as const;

export default function WalletRewardsPage() {
  const { status, identity, error } = useWallet();
  const sparkBalance = useSparkBalance();
  const connected = status === "connected" && Boolean(identity.address);
  const baseReady = isBaseChain(identity.chainId);
  const accountLabel = identity.address ? shortAddress(identity.address) : "No wallet connected";
  const networkLabel = identity.chainName ?? "Waiting for wallet";

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="container mx-auto max-w-5xl px-4">
        <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-border/60 bg-card/70 p-6 shadow-2xl shadow-black/20"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Wallet command</p>
                <h1 className="mt-2 text-3xl font-bold text-foreground">Wallet and rewards</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Connect once, stake in USDC, earn Spark alongside ETH or Bitcoin-side assets, and control what wallet
                  signals matches can see.
                </p>
              </div>
              <WalletConnectButton className="sm:mt-1" />
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border/60 bg-background/50 p-4">
                <p className="text-xs text-muted-foreground">Account</p>
                <p className="mt-2 truncate font-mono text-sm font-semibold text-foreground" title={identity.address ?? undefined}>
                  {accountLabel}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-background/50 p-4">
                <p className="text-xs text-muted-foreground">Network</p>
                <p className={baseReady ? "mt-2 text-sm font-semibold text-primary" : "mt-2 text-sm font-semibold text-accent"}>
                  {networkLabel}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-background/50 p-4">
                <p className="text-xs text-muted-foreground">Native (gas)</p>
                <p className="mt-2 font-mono text-sm font-semibold text-foreground">
                  {identity.balanceEth ? `${identity.balanceEth} ETH` : connected ? "Refreshing" : "Locked"}
                </p>
              </div>
              <div className="rounded-lg border border-accent/25 bg-accent/5 p-4">
                <p className="text-xs text-muted-foreground">Spark (SPARK)</p>
                <p className="mt-2 font-mono text-sm font-semibold text-accent">{formatSparkAmount(sparkBalance)}</p>
              </div>
            </div>

            {error ? (
              <div className="mt-5 flex gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
                <p>{error}</p>
              </div>
            ) : null}

            {connected && !baseReady ? (
              <div className="mt-5 flex gap-3 rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm text-accent">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <p>Switch to Base or Base Sepolia before funding stakes or claiming rewards.</p>
              </div>
            ) : null}
          </motion.div>

          <div className="flex flex-col gap-3">
            <SparkBalanceHighlight className="shadow-lg shadow-black/10" />
            <Link
              href={routes.matchmaker}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card/80 px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/60"
            >
              Open matchmaker <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>

        <section className="mt-8">
          <ApiWalletSessionPanel />
        </section>

        <section id="bitcoin-stack" className="mt-8 scroll-mt-24">
          <BitcoinStackPanel />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <div className="space-y-4">
            {walletActions.map((action) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-border/60 bg-card/60 p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <action.icon className="h-5 w-5 text-primary" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.detail}</p>
                    </div>
                  </div>
                  <p className="shrink-0 text-right text-sm font-semibold text-foreground">{action.value}</p>
                </div>
              </motion.div>
            ))}
            <WalletValueOptIn />
          </div>

          <div className="rounded-lg border border-border/60 bg-card/60 p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Trophy className="h-5 w-5 text-accent" aria-hidden /> Integrity leaderboard
            </h2>
            <ul className="mt-5 space-y-3">
              {DEMO_LEADERBOARD.map((row) => (
                <li
                  key={row.rank}
                  className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 rounded-lg border border-border/50 bg-background/40 px-3 py-3 text-sm"
                >
                  <span className="text-muted-foreground">#{row.rank}</span>
                  <span className="truncate font-mono text-foreground">{row.handle}</span>
                  <span className="font-semibold text-primary">{row.score}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-start gap-3 rounded-lg border border-border/60 bg-background/40 p-4 text-sm text-muted-foreground">
              <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <p>Scores stay bound to wallet ownership, not a throwaway profile.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
