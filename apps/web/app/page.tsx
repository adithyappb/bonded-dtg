"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Lock, Mail, Shield, Sparkles, UserPlus, Zap } from "lucide-react";
import Link from "next/link";
import { HomeLivePreview } from "@/components/home/HomeLivePreview";
import { IdentityFooterCard } from "@/components/home/IdentityFooterCard";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { enterAppSession } from "@/lib/app-session";
import { routes } from "@/lib/routes";

const features = [
  {
    icon: Lock,
    title: "Stake-to-Date",
    desc: "Both people stake USDC on Base before a date. Reliable people get rewarded.",
  },
  {
    icon: Shield,
    title: "On-chain reputation",
    desc: "EAS attestations and a public Ghost Score.",
  },
  {
    icon: Zap,
    title: "Earn Spark (SPARK)",
    desc: "Bonded’s native reward token — accrues with dates and matchmaking, alongside your USDC stakes and other crypto.",
  },
  {
    icon: Sparkles,
    title: "Refined matching",
    desc: "Bonded surfaces people by fit, trust, and intent instead of pure swipe chaos.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-45"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1800&auto=format&fit=crop')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/86 to-background/48" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-transparent to-background" />
        </div>

        <div className="container relative mx-auto grid min-h-[calc(100vh-4rem)] items-center gap-10 px-4 py-14 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 py-1.5">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Base L2 / XMTP / World ID</span>
            </div>

            <h1 className="font-heading text-5xl md:text-7xl font-bold leading-tight">
              Meet people who show up.
            </h1>

            <p className="text-lg text-muted-foreground mt-6 max-w-lg leading-relaxed">
              Wallet-native dating with verified identity, staked commitments, private chat, and reputation that follows behavior.
            </p>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {["Verified profiles", "USDC commitments", "Reputation rewards"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-secondary-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.7, ease: "easeOut" }}
            className="rounded-lg border border-border/60 bg-card/80 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Start here</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">Sign in or create your profile</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Connect your wallet, add the details that matter, then start swiping with stake-ready matches.
            </p>

            <div className="mt-6 space-y-3">
              <WalletConnectButton className="min-h-12 w-full" showAddress />
              <Link
                href={routes.authEmail}
                className="flex min-h-12 items-center justify-center gap-2 rounded-lg border border-primary/35 bg-primary/10 px-5 text-sm font-semibold text-primary transition-colors hover:bg-primary/15"
              >
                Email + OTP (dev only) <Mail className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href={routes.onboarding}
                className="gradient-emerald flex min-h-12 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold text-primary-foreground"
              >
                New user setup <UserPlus className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href={routes.discover}
                onClick={() => enterAppSession()}
                className="flex min-h-12 items-center justify-center gap-2 rounded-lg border border-border bg-background/50 px-5 text-sm font-semibold text-foreground transition-colors hover:border-primary/60"
              >
                Existing user, enter app <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>

            <div className="mt-6 rounded-lg border border-border/60 bg-background/45 p-4">
              <p className="text-sm font-semibold text-foreground">What unlocks next</p>
              <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                <span>1. Add profile details, prompts, photos, and match preferences.</span>
                <span>2. Swipe verified profiles and make stake-backed plans.</span>
                <span>3. Track commitments, rewards, dates, and Ghost Score in the dashboard.</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold">
              Proof-of-<span className="text-gradient-gold">Commitment</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 hover:border-primary/30 transition-colors group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:glow-emerald transition-shadow">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <HomeLivePreview />

      <IdentityFooterCard />

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md gradient-emerald flex items-center justify-center">
              <Shield className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="font-heading font-semibold text-sm text-foreground">Bonded</span>
          </div>
          <p className="text-xs text-muted-foreground">(c) 2026 Bonded</p>
        </div>
      </footer>
    </div>
  );
}
