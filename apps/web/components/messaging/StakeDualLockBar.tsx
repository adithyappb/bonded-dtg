"use client";

import { motion } from "framer-motion";
import { Lock, LockOpen } from "lucide-react";
import { cn } from "@/lib/cn";

type StakeDualLockBarProps = {
  youLabel?: string;
  peerName: string;
  /** Your side has posted funds (first participant slot). */
  youLocked: boolean;
  /** Counterparty has posted funds (second slot). */
  peerLocked: boolean;
  /** Both sides funded — full escrow lock active. */
  fullyLocked: boolean;
  /** First slot is confirming on-chain. */
  youLocking?: boolean;
};

/**
 * Visual dual-lock: escrow only fully locks once both parties have staked.
 */
export function StakeDualLockBar({
  youLabel = "You",
  peerName,
  youLocked,
  peerLocked,
  fullyLocked,
  youLocking = false,
}: StakeDualLockBarProps) {
  return (
    <div className="rounded-lg border border-border/80 bg-secondary/40 px-3 py-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Dual-lock escrow</p>
        {fullyLocked ? (
          <motion.span
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary"
          >
            Both locked
          </motion.span>
        ) : (
          <span className="text-[10px] text-muted-foreground">Fund both sides to lock</span>
        )}
      </div>
      <div className="flex items-stretch gap-2">
        <LockSlot
          label={youLabel}
          locked={youLocked}
          pending={youLocking}
          highlight={youLocked && !fullyLocked}
        />
        <div className="flex w-6 flex-shrink-0 flex-col items-center justify-center">
          <div
            className={cn(
              "h-0.5 w-full rounded-full transition-colors duration-300",
              fullyLocked ? "bg-primary" : "bg-border",
            )}
            aria-hidden
          />
        </div>
        <LockSlot
          label={peerName}
          locked={peerLocked}
          pending={false}
          highlight={peerLocked && !fullyLocked}
        />
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
        {fullyLocked
          ? "Full escrow is locked — funds stay in contract until check-in or resolution."
          : youLocked && !peerLocked
            ? "Your stake is locked. Their stake is still required to seal the pot."
            : "Neither party can withdraw until both sides post or you use an eligible exit path."}
      </p>
    </div>
  );
}

function LockSlot({
  label,
  locked,
  pending,
  highlight,
}: {
  label: string;
  locked: boolean;
  pending: boolean;
  highlight: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center rounded-md border px-2 py-2 transition-colors",
        locked && "border-primary/50 bg-primary/10",
        highlight && !locked && "border-accent/40 bg-accent/5",
        !locked && !highlight && "border-border/80 bg-background/40",
      )}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/80">
        {pending ? (
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="text-primary"
          >
            <Lock className="h-5 w-5 opacity-70" aria-hidden />
          </motion.div>
        ) : locked ? (
          <motion.div initial={{ scale: 0.85 }} animate={{ scale: 1 }} className="text-primary">
            <Lock className="h-5 w-5" aria-hidden />
          </motion.div>
        ) : (
          <LockOpen className="h-5 w-5 text-muted-foreground/70" aria-hidden />
        )}
      </div>
      <p className="mt-1.5 truncate text-center text-[10px] font-medium text-foreground">{label}</p>
      <p className="text-[9px] text-muted-foreground">
        {pending ? "Locking…" : locked ? "Staked" : "Open"}
      </p>
    </div>
  );
}
