"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { readApiWalletSession, sendInjectedWalletTransaction } from "@/lib/injected-evm-wallet";

export function NftMintButton({
  collectionType,
  profileId,
  achievementId,
  tokenUri,
  label,
  metadata,
}: {
  collectionType: "achievement_badge" | "reputation_anchor" | "relationship_agreement";
  profileId: string;
  achievementId?: string;
  tokenUri: string;
  label: string;
  metadata?: Record<string, unknown>;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function mint() {
    const session = readApiWalletSession();
    if (!session) {
      setStatus("Complete API wallet login (dev-login) from Wallet page with the API running.");
      return;
    }

    setBusy(true);
    setStatus("Creating NFT mint intent...");

    try {
      const intent = await apiClient.createNftMintIntent(session, {
        collectionType,
        profileId,
        achievementId,
        chainId: session.chainId,
        recipientAddress: session.address,
        tokenUri,
        metadata,
      });

      if (!intent.mintRequest.ready || !intent.mintRequest.toAddress || !intent.mintRequest.data) {
        setStatus(intent.mintRequest.reason ?? "NFT collection is not ready on this chain.");
        return;
      }

      const hash = await sendInjectedWalletTransaction({
        chainId: intent.mintRequest.chainId,
        from: session.address,
        to: intent.mintRequest.toAddress,
        valueWei: intent.mintRequest.valueWei ?? "0",
        data: intent.mintRequest.data,
      });

      await apiClient.attachNftMintTransaction(session, intent.intent.id, {
        chainId: intent.mintRequest.chainId,
        hash,
      });
      setStatus(`Mint broadcast ${hash.slice(0, 10)}… and linked to your profile.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "NFT mint failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-border/60 bg-card/50 p-4 space-y-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => void mint()}
        className="inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-secondary/40 px-4 text-sm font-semibold text-foreground hover:border-primary/50 disabled:opacity-60"
      >
        {busy ? "Opening wallet…" : label}
      </button>
      {status ? (
        <p className={`text-sm ${status.startsWith("Mint broadcast") ? "text-primary" : "text-destructive"}`}>{status}</p>
      ) : null}
    </div>
  );
}
