"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Wallet, Copy, ExternalLink, Award, Calendar, MapPin, Edit3, Eye } from "lucide-react";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { ReputationBadge } from "@/components/vouch/ReputationBadge";
import { VerifiedHumanBadge } from "@/components/identity/VerifiedHumanBadge";
import { shortAddress, useWallet } from "@/lib/wallet";
import { useWalletSignalSharing } from "@/lib/wallet-signal-preference";
import { AchievementGrid } from "@/components/achievements/AchievementGrid";
import { SparkBalanceHighlight } from "@/components/wallet/SparkBalanceHighlight";
import { trustTierLabel } from "@/lib/trust";
import { useTrustProfile } from "@/lib/hooks/useTrustProfile";
import { routes } from "@/lib/routes";
import { useGhostScore } from "@/lib/ghost-score";
import { setWalletSignalSharing } from "@/lib/wallet-signal-preference";
import { ProfilePreview } from "@/components/profile/ProfilePreview";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { useState } from "react";
import { useAppState } from "@/components/app/AppStateProvider";

export default function ProfilePage() {
  const { userProfile } = useAppState();
  const ghostScore = useGhostScore();
  const trust = useTrustProfile();
  const { identity, status } = useWallet();
  const connected = status === "connected" && Boolean(identity.address);
  const walletSignalOn = useWalletSignalSharing();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const display =
    identity.displayName ||
    (identity.address ? shortAddress(identity.address) : "Connect wallet");

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="container mx-auto px-4 max-w-2xl">
         <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-6 cursor-pointer hover:border-primary/20 transition-all active:scale-[0.99]"
          onClick={() => setIsPreviewOpen(true)}
        >
          <div className="flex items-start gap-5">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden">
              <Image
                src={userProfile.image}
                alt="Profile"
                width={80}
                height={80}
                className="object-cover h-20 w-20"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full gradient-emerald flex items-center justify-center">
                <Shield className="w-3 h-3 text-primary-foreground" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-2xl font-bold text-foreground">{userProfile.name}</h1>
                <VerifiedHumanBadge verified={identity.worldIdVerified} />
              </div>
              <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="w-3.5 h-3.5" /> {userProfile.location} ·{" "}
                <Calendar className="w-3.5 h-3.5" /> {userProfile.age}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                title="View public preview"
                className="glass-card p-2 hover:border-primary/30 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPreviewOpen(true);
                }}
              >
                <Eye className="w-4 h-4 text-muted-foreground" />
              </button>
              <button
                type="button"
                title="Edit profile"
                className="glass-card p-2 hover:border-primary/30 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditorOpen(true);
                }}
              >
                <Edit3 className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-3 rounded-lg border border-border/60 bg-secondary/40 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Wallet className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground font-mono truncate">
                  {connected ? display : "Not connected"}
                </span>
              </div>
              {connected ? (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => identity.address && void navigator.clipboard?.writeText(identity.address)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <a
                  href={`https://basescan.org/address/${identity.address!}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              ) : (
                <WalletConnectButton compact showAddress={false} />
              )}
            </div>
            {identity.chainName ? <p className="text-xs text-muted-foreground">Network: {identity.chainName}</p> : null}
            {identity.ensName ? <p className="text-xs text-primary">ENS: {identity.ensName}</p> : null}
            {identity.lensHandle ? (
              <p className="text-xs text-muted-foreground">Lens: {identity.lensHandle}</p>
            ) : null}
            <div
              className={`mt-3 rounded-md border px-3 py-2 text-xs ${
                walletSignalOn
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border/60 bg-background/30 text-muted-foreground"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-foreground">Wallet signal to matches</span>
                <span className="shrink-0 font-semibold">{walletSignalOn ? "On" : "Off"}</span>
              </div>
              {connected ? (
                <button
                  type="button"
                  onClick={() => setWalletSignalSharing(!walletSignalOn)}
                  className="mt-2 w-full rounded-md border border-border/70 bg-background/50 py-1.5 text-[11px] font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary"
                >
                  {walletSignalOn ? "Turn off signal" : "Turn on signal"}
                </button>
              ) : (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  <Link href={routes.wallet} className="font-semibold text-primary underline-offset-2 hover:underline">
                    Connect in Wallet
                  </Link>{" "}
                  to manage this.
                </p>
              )}
            </div>
          </div>
        </motion.div>

        <div className="mt-6">
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Reputation</h2>
          <div className="grid grid-cols-3 gap-3">
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
          <ul className="mt-3 space-y-2 rounded-lg border border-border/60 bg-secondary/25 p-3 text-xs text-muted-foreground">
            {trust.factors.slice(0, 5).map((f) => (
              <li key={f.label} className="flex justify-between gap-2">
                <span className="text-foreground/90">{f.label}</span>
                <span className="shrink-0 font-mono text-[10px] text-primary">
                  {f.points > 0 ? `+${f.points}` : "—"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-accent" /> NFT achievements
          </h2>
          <AchievementGrid />
        </div>

        <SparkBalanceHighlight compact className="glass-card mt-6" />
      </div>

      <ProfilePreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        profile={{
          ...userProfile,
          lastActive: "Active now",
        }}
      />

      <ProfileEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        initialData={{
          bio: userProfile.bio,
          photos: [userProfile.image],
        }}
      />
    </div>
  );
}
