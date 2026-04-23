"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { readApiWalletSession, sendInjectedWalletTransaction } from "@/lib/injected-evm-wallet";

export function CryptoPaymentButton({
  purpose,
  amountWei,
  label,
  relatedId,
  metadata,
}: {
  purpose: string;
  amountWei: string;
  label: string;
  relatedId?: string;
  metadata?: Record<string, unknown>;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function pay() {
    const session = readApiWalletSession();
    if (!session) {
      setStatus("Complete API wallet login with the API running (see Wallet page).");
      return;
    }

    setBusy(true);
    setStatus("Creating ETH payment intent...");

    try {
      const intent = await apiClient.createPaymentIntent(session, {
        purpose,
        relatedId,
        chainId: session.chainId,
        amountWei,
        metadata,
      });
      const hash = await sendInjectedWalletTransaction({
        chainId: intent.paymentRequest.chainId,
        from: session.address,
        to: intent.paymentRequest.toAddress,
        valueWei: intent.paymentRequest.valueWei,
      });

      await apiClient.attachPaymentTransaction(session, intent.intent.id, {
        chainId: intent.paymentRequest.chainId,
        hash,
      });
      setStatus(`Broadcast ${hash.slice(0, 10)}… and linked to ${purpose.replaceAll("_", " ")}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Payment failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-border/60 bg-card/50 p-4 space-y-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => void pay()}
        className="inline-flex min-h-10 items-center justify-center rounded-lg gradient-emerald px-4 text-sm font-semibold text-primary-foreground glow-emerald disabled:opacity-60"
      >
        {busy ? "Opening wallet…" : label}
      </button>
      {status ? (
        <p className={`text-sm ${status.startsWith("Broadcast") ? "text-primary" : "text-destructive"}`}>{status}</p>
      ) : null}
    </div>
  );
}
