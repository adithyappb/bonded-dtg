"use client";

import { Lock } from "lucide-react";
import Link from "next/link";
import { CryptoPaymentButton } from "@/components/crypto/CryptoPaymentButton";
import { NftMintButton } from "@/components/nft/NftMintButton";
import { routes } from "@/lib/routes";

export default function PremiumPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-xl space-y-10">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">Elite circles</h1>
        <p className="text-muted-foreground text-sm mt-2">Token-gated pools (demo).</p>
        <div className="glass-card p-8 mt-8 flex flex-col items-center text-center gap-4">
          <Lock className="w-10 h-10 text-accent" />
          <Link href={routes.wallet} className="text-primary font-medium hover:underline">
            Wallet &amp; rewards
          </Link>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold text-foreground">On-chain extras (API)</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Requires <code className="text-xs text-primary">npm run dev:api</code>, Supabase from{" "}
          <code className="text-xs">.env</code>, and an API wallet session from the Wallet page.
        </p>
        <CryptoPaymentButton
          purpose="premium_tip_demo"
          amountWei="1000000000000000"
          label="Send 0.001 ETH (demo intent)"
          relatedId="premium-demo"
        />
        <NftMintButton
          collectionType="achievement_badge"
          profileId="demo-profile"
          achievementId="early-adopter"
          tokenUri="ipfs://demo-achievement-badge"
          label="Mint achievement badge (demo)"
        />
      </section>
    </div>
  );
}
