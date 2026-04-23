"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { MATCH_PROFILES } from "@/lib/matching-data";
import {
  effectiveUsdcFeePercent,
  hasIntroducedPair,
  listMutualPairs,
  modeledSuccessPercent,
  pairKeyForProfiles,
  sparkRewardForMutualFit,
  tryRecordSuccessfulIntro,
  useSuccessfulMatchmakerIntros,
  type MutualPair,
} from "@/lib/matchmaker";
import { addSpark } from "@/lib/spark";

export function CuratedCandidateList() {
  const pairs = useMemo(() => listMutualPairs(MATCH_PROFILES), []);
  const matchmakerSession = useSuccessfulMatchmakerIntros();
  const [toast, setToast] = useState<string | null>(null);

  const handleIntro = useCallback((pair: MutualPair) => {
    const key = pairKeyForProfiles(pair.a, pair.b);
    const credited = tryRecordSuccessfulIntro(key);
    if (credited) {
      const spark = sparkRewardForMutualFit(pair.mutualScore);
      addSpark(spark);
      setToast(
        `Intro recorded — +${spark} SPARK (scales with ${pair.mutualScore}% mutual fit) · “Cupid’s Ledger” progress.`,
      );
    } else {
      setToast("You already recorded an intro for this pair.");
    }
    window.setTimeout(() => setToast(null), 4500);
  }, []);

  if (pairs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No mutual preference pairs above the current fit threshold. When two people’s filters align in
        both directions, they will appear here.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {toast ? (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-emerald-400/90 bg-emerald-950/40 border border-emerald-500/20 rounded-lg px-3 py-2"
        >
          {toast}
        </motion.p>
      ) : null}

      <ul className="space-y-3">
        {pairs.map((pair) => {
          const key = pairKeyForProfiles(pair.a, pair.b);
          const done = hasIntroducedPair(key);
          const sparkPreview = sparkRewardForMutualFit(pair.mutualScore);
          const feePct = effectiveUsdcFeePercent(pair.mutualScore);
          const successOdds = modeledSuccessPercent(pair.mutualScore);
          return (
            <li
              key={key}
              className="rounded-xl border border-border/60 bg-background/40 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex -space-x-2 shrink-0">
                  <Image
                    src={pair.a.image}
                    alt=""
                    width={40}
                    height={40}
                    className="rounded-full ring-2 ring-background object-cover w-10 h-10"
                  />
                  <Image
                    src={pair.b.image}
                    alt=""
                    width={40}
                    height={40}
                    className="rounded-full ring-2 ring-background object-cover w-10 h-10"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">
                    {pair.a.name} & {pair.b.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Mutual fit {pair.mutualScore}% · A→B {pair.fitFromAPerspective}% · B→A{" "}
                    {pair.fitFromBPerspective}%
                  </p>
                  <p className="text-[11px] text-muted-foreground/90 mt-1 leading-snug">
                    Revenue scales with fit: ~{sparkPreview} SPARK · up to {feePct}% USDC fee tier · modeled
                    success odds {successOdds}% (drops sharply as fit falls)
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={done}
                onClick={() => handleIntro(pair)}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors shrink-0",
                  done
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/90",
                )}
              >
                <Heart className="w-4 h-4" />
                {done ? "Intro recorded" : "Introduce & earn"}
              </button>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-muted-foreground">
        Intros credited this session: {matchmakerSession}.         SPARK and fee % are linear in mutual fit; modeled success (and expected profit) falls much faster
        when fit falls because odds scale roughly with fit squared.
      </p>
    </div>
  );
}
