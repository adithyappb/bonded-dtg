"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BadgeCheck, ChevronDown, Handshake, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { cn } from "@/lib/cn";
import { confirmPeerMet, confirmSelfMet, useMeetVerification } from "@/lib/trust";

type MeetVerificationPanelProps = {
  threadId: string;
  peerName: string;
  /** When the date pipeline is already fully released (e.g. 100% agreement). */
  agreementComplete: boolean;
};

export function MeetVerificationPanel({ threadId, peerName, agreementComplete }: MeetVerificationPanelProps) {
  const meet = useMeetVerification(threadId);
  const [busy, setBusy] = useState(false);
  /** Start collapsed so the thread stays readable; expand to act or read details. */
  const [expanded, setExpanded] = useState(false);

  const onSelfConfirm = useCallback(() => {
    setBusy(true);
    window.setTimeout(() => {
      confirmSelfMet(threadId);
      setBusy(false);
    }, 400);
  }, [threadId]);

  const onSimulatePeer = useCallback(() => {
    setBusy(true);
    window.setTimeout(() => {
      confirmPeerMet(threadId);
      setBusy(false);
    }, 500);
  }, [threadId]);

  const mutual = meet.selfConfirmed && meet.peerConfirmed;

  const collapsedSummary = agreementComplete
    ? "Mutual meet verified on-chain"
    : mutual
      ? "Mutual verification recorded"
      : meet.selfConfirmed
        ? `Waiting on ${peerName} to confirm`
        : "Confirm you met in person";

  const collapsedHint = agreementComplete ? "Attested · expand for details" : mutual ? "Done · expand for details" : "Tap to expand";

  return (
    <div className="border-b border-border bg-card/40">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-secondary/40"
        aria-expanded={expanded}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          {agreementComplete || mutual ? (
            <BadgeCheck className="h-4 w-4 text-primary" aria-hidden />
          ) : (
            <Handshake className="h-4 w-4 text-accent" aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground leading-tight">{collapsedSummary}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{collapsedHint}</p>
        </div>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200", expanded && "rotate-180")}
          aria-hidden
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/60 bg-card/60"
          >
            <div className="px-4 pb-3 pt-1">
              {agreementComplete ? (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Both parties attested this date — EAS / on-chain release completed. This strengthens legitimacy and trust
                  scoring.
                </p>
              ) : mutual ? (
                <p className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
                  Mutual verification recorded — this feeds your trust profile and achievement NFTs.
                </p>
              ) : (
                <>
                  <p className="text-[11px] leading-relaxed text-muted-foreground mb-3">
                    Independent confirmations reduce catfishing. Both sides must confirm for a mutual attestation (demo
                    simulates peer confirmation).
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <button
                      type="button"
                      onClick={onSelfConfirm}
                      disabled={meet.selfConfirmed || busy}
                      className={cn(
                        "inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                        meet.selfConfirmed
                          ? "cursor-default border border-primary/40 bg-primary/10 text-primary"
                          : "gradient-emerald text-primary-foreground hover:brightness-110",
                      )}
                    >
                      {busy && !meet.selfConfirmed ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
                      {meet.selfConfirmed ? "You confirmed" : "We met in person"}
                    </button>
                    <button
                      type="button"
                      onClick={onSimulatePeer}
                      disabled={!meet.selfConfirmed || meet.peerConfirmed || busy}
                      className="inline-flex flex-1 items-center justify-center rounded-lg border border-border bg-secondary/80 px-3 py-2 text-xs font-semibold text-secondary-foreground transition-colors hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {meet.peerConfirmed ? `${peerName} confirmed` : `Simulate ${peerName} confirms`}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
