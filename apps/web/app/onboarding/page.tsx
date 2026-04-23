"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Fingerprint, Wallet, ArrowRight, Check, UserRound } from "lucide-react";
import Link from "next/link";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { routes } from "@/lib/routes";
import { useWallet } from "@/lib/wallet";

const steps = [
  {
    id: "auth",
    title: "Sign in",
    body: "Social login with an embedded self-custodial wallet (Privy-style).",
    icon: Mail,
  },
  {
    id: "world",
    title: "Prove you're human",
    body: "World ID unlocks the Verified Human badge.",
    icon: Fingerprint,
  },
  {
    id: "details",
    title: "Add your details",
    body: "Set the first profile signals matches will see before you start swiping.",
    icon: UserRound,
  },
  {
    id: "wallet",
    title: "Identity handle",
    body: "Link ENS or Lens so matches see a trusted handle instead of a raw address.",
    icon: Wallet,
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({
    name: "",
    city: "",
    intent: "Thoughtful dates",
  });
  const { status } = useWallet();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 md:p-10 glow-emerald"
        >
          <p className="text-xs font-medium text-primary uppercase tracking-widest">Onboarding</p>
          <h1 className="font-heading text-3xl font-bold text-foreground mt-2">Get started</h1>

          <div className="flex gap-2 mt-8 mb-8">
            {steps.map((s, i) => (
              <div
                key={s.id}
                className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-secondary"}`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/15 flex items-center justify-center mb-4">
                {(() => {
                  const Icon = steps[step]!.icon;
                  return <Icon className="w-6 h-6 text-primary" />;
                })()}
              </div>
              <h2 className="font-heading text-xl font-semibold text-foreground">{steps[step]!.title}</h2>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{steps[step]!.body}</p>
              {steps[step]!.id === "details" ? (
                <div className="mt-6 grid gap-3">
                  <label className="grid gap-1.5 text-xs font-semibold text-muted-foreground">
                    Display name
                    <input
                      value={profile.name}
                      onChange={(event) => setProfile((value) => ({ ...value, name: event.target.value }))}
                      placeholder="Adithya"
                      className="min-h-11 rounded-lg border border-border bg-background/60 px-3 text-sm font-normal text-foreground outline-none focus:border-primary"
                    />
                  </label>
                  <label className="grid gap-1.5 text-xs font-semibold text-muted-foreground">
                    City
                    <input
                      value={profile.city}
                      onChange={(event) => setProfile((value) => ({ ...value, city: event.target.value }))}
                      placeholder="New York"
                      className="min-h-11 rounded-lg border border-border bg-background/60 px-3 text-sm font-normal text-foreground outline-none focus:border-primary"
                    />
                  </label>
                  <label className="grid gap-1.5 text-xs font-semibold text-muted-foreground">
                    Dating intent
                    <select
                      value={profile.intent}
                      onChange={(event) => setProfile((value) => ({ ...value, intent: event.target.value }))}
                      className="min-h-11 rounded-lg border border-border bg-background/60 px-3 text-sm font-normal text-foreground outline-none focus:border-primary"
                    >
                      <option>Thoughtful dates</option>
                      <option>Long-term match</option>
                      <option>Crypto-native friends first</option>
                    </select>
                  </label>
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-col sm:flex-row gap-3 mt-10">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="flex-1 rounded-lg border border-border py-3 text-sm font-medium hover:bg-secondary/80"
              >
                Back
              </button>
            ) : null}
            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
                className="gradient-emerald flex-1 rounded-lg py-3 font-heading font-semibold text-primary-foreground inline-flex items-center justify-center gap-2"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex-1">
                {status === "connected" ? (
                  <Link
                    href={routes.discover}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-lg border border-primary/50 bg-primary/10 text-sm font-semibold text-primary"
                  >
                    <Check className="w-4 h-4" /> Connected
                  </Link>
                ) : (
                  <WalletConnectButton className="min-h-12 w-full" showAddress={false} />
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
