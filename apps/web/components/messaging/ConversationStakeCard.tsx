"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Lock,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StakeDualLockBar } from "@/components/messaging/StakeDualLockBar";
import { useGhostScore } from "@/lib/ghost-score";
import { useActiveStake } from "@/lib/hooks/useStake";
import {
  beginStake,
  claimPeerNeverFunded,
  DEMO_LOCAL_USER_ID,
  formatUsdc,
  fundStakeSide,
  FULL_ESCROW_USDC,
  STAKE_PER_SIDE_USDC,
  type StakeParticipant,
} from "@/lib/stake";
import { cn } from "@/lib/cn";

type UiPhase = "cta" | "locking" | "await_peer" | "escrow_live" | "claiming";

export function ConversationStakeCard({
  peerId,
  peerName,
}: {
  peerId: string;
  peerName: string;
}) {
  const active = useActiveStake();
  const myGhost = useGhostScore();
  const [phase, setPhase] = useState<UiPhase>("cta");
  const [stakeId, setStakeId] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ tone: "info" | "success" | "warn"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const participants = useMemo((): [StakeParticipant, StakeParticipant] => {
    return [
      { id: DEMO_LOCAL_USER_ID, displayName: "You", ghostScore: myGhost },
      { id: peerId, displayName: peerName, ghostScore: 14 },
    ];
  }, [peerId, peerName, myGhost]);

  useEffect(() => {
    if (!stakeId || !active || active.id !== stakeId) return;
    if (active.status === "locked") {
      setPhase("escrow_live");
    } else if (active.status === "awaiting_peer") {
      setPhase("await_peer");
    }
  }, [active, stakeId]);

  const dualLock = useMemo(() => {
    const stake = active?.id === stakeId ? active : null;
    if (!stakeId && phase !== "locking") {
      return {
        youLocked: false,
        peerLocked: false,
        fullyLocked: false,
        youLocking: false,
      };
    }
    if (!stake) {
      return {
        youLocked: phase === "await_peer" || phase === "escrow_live",
        peerLocked: phase === "escrow_live",
        fullyLocked: phase === "escrow_live",
        youLocking: phase === "locking",
      };
    }
    const aps = stake.amountPerSide;
    const youL = stake.contributions[0] >= aps;
    const peerL = stake.contributions[1] >= aps;
    const full = stake.status === "locked";
    return {
      youLocked: youL,
      peerLocked: peerL,
      fullyLocked: full,
      youLocking: phase === "locking" && !youL,
    };
  }, [active, stakeId, phase]);

  const showDualLockBar = stakeId !== null || phase === "locking";

  const startFlow = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setBanner(null);
    setPhase("locking");
    try {
      const s = await beginStake(STAKE_PER_SIDE_USDC, participants);
      setStakeId(s.id);
      const afterSelf = await fundStakeSide(s.id, DEMO_LOCAL_USER_ID);
      if (afterSelf.status === "locked") {
        setPhase("escrow_live");
        setBanner({
          tone: "success",
          text: `Full escrow ${formatUsdc(FULL_ESCROW_USDC)} — both sides posted ${formatUsdc(STAKE_PER_SIDE_USDC)}.`,
        });
      } else {
        setPhase("await_peer");
        setBanner({
          tone: "info",
          text: `Your ${formatUsdc(STAKE_PER_SIDE_USDC)} is locked. They still owe ${formatUsdc(STAKE_PER_SIDE_USDC)} (${formatUsdc(FULL_ESCROW_USDC)} total when both post).`,
        });
      }
    } catch (e) {
      setPhase("cta");
      setBanner({ tone: "warn", text: e instanceof Error ? e.message : "Could not start stake." });
    } finally {
      setBusy(false);
    }
  }, [busy, participants]);

  const simulatePeerFunds = useCallback(async () => {
    if (!stakeId || busy) return;
    setBusy(true);
    setBanner(null);
    try {
      const next = await fundStakeSide(stakeId, peerId);
      if (next.status === "locked") {
        setPhase("escrow_live");
        setBanner({
          tone: "success",
          text: `Full escrow ${formatUsdc(FULL_ESCROW_USDC)} — QR check-in releases funds after the date.`,
        });
      }
    } catch (e) {
      setBanner({ tone: "warn", text: e instanceof Error ? e.message : "Peer funding failed." });
    } finally {
      setBusy(false);
    }
  }, [stakeId, peerId, busy]);

  const claimNoShow = useCallback(async () => {
    if (!stakeId || busy) return;
    setBusy(true);
    setPhase("claiming");
    setBanner(null);
    try {
      const res = await claimPeerNeverFunded(stakeId, DEMO_LOCAL_USER_ID);
      setBanner({ tone: "success", text: res.payoutNote });
      setPhase("cta");
      setStakeId(null);
    } catch (e) {
      setPhase("await_peer");
      setBanner({ tone: "warn", text: e instanceof Error ? e.message : "Claim failed." });
    } finally {
      setBusy(false);
    }
  }, [stakeId, busy]);

  const icon =
    phase === "locking" || phase === "claiming" ? (
      <Loader2 className="h-5 w-5 animate-spin text-primary-foreground" aria-hidden />
    ) : phase === "escrow_live" ? (
      <CheckCircle2 className="h-5 w-5 text-primary-foreground" aria-hidden />
    ) : (
      <Lock className="h-5 w-5 text-primary-foreground" aria-hidden />
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[85%] rounded-xl border border-primary/40 bg-primary/5 p-4 shadow-sm shadow-primary/5"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg gradient-emerald">{icon}</div>
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="font-heading text-sm font-semibold text-foreground">Date stake</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              Each posts {formatUsdc(STAKE_PER_SIDE_USDC)} · full pot {formatUsdc(FULL_ESCROW_USDC)}. If they never post
              their half, you can claim the full {formatUsdc(FULL_ESCROW_USDC)} and their Ghost Score takes the hit.
            </p>
          </div>

          {showDualLockBar ? (
            <StakeDualLockBar
              peerName={peerName}
              youLocked={dualLock.youLocked}
              peerLocked={dualLock.peerLocked}
              fullyLocked={dualLock.fullyLocked}
              youLocking={dualLock.youLocking}
            />
          ) : null}

          <AnimatePresence mode="wait">
            {banner ? (
              <motion.p
                key={banner.text}
                role="status"
                aria-live="polite"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={cn(
                  "rounded-lg px-3 py-2 text-xs leading-snug",
                  banner.tone === "success" && "bg-primary/15 text-foreground",
                  banner.tone === "info" && "bg-secondary/80 text-secondary-foreground",
                  banner.tone === "warn" && "border border-destructive/40 bg-destructive/10 text-destructive",
                )}
              >
                {banner.text}
              </motion.p>
            ) : null}
          </AnimatePresence>

          {phase === "cta" || phase === "locking" ? (
            <button
              type="button"
              onClick={startFlow}
              disabled={busy || phase === "locking"}
              aria-busy={phase === "locking"}
              className={cn(
                "mt-1 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-heading font-semibold transition-colors",
                "gradient-emerald text-primary-foreground glow-emerald hover:brightness-110",
                busy && "cursor-wait opacity-90",
              )}
            >
              {phase === "locking" ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
              ) : (
                <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
              )}
              <span>
                {phase === "locking"
                  ? "Locking your side…"
                  : `Lock ${formatUsdc(STAKE_PER_SIDE_USDC)} to open escrow`}
              </span>
            </button>
          ) : null}

          {phase === "await_peer" ? (
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Waiting on them</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={simulatePeerFunds}
                  disabled={busy}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-primary/35 bg-background/60 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary/60 hover:bg-primary/5"
                >
                  <UserPlus className="h-3.5 w-3.5 opacity-80" aria-hidden />
                  They funded (demo)
                </button>
                <button
                  type="button"
                  onClick={claimNoShow}
                  disabled={busy}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
                >
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
                  Never funded — claim {formatUsdc(FULL_ESCROW_USDC)}
                </button>
              </div>
            </div>
          ) : null}

          {phase === "escrow_live" ? (
            <div className="rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-xs text-primary">
              <span className="font-semibold">Escrow live.</span> Both sides posted {formatUsdc(STAKE_PER_SIDE_USDC)} ·{" "}
              {formatUsdc(FULL_ESCROW_USDC)} held until check-in.
            </div>
          ) : null}

          {phase === "claiming" ? (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              Settling on-chain…
            </p>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
