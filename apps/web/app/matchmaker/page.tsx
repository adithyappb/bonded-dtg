"use client";

import { MatchmakerRewardPanel } from "@/components/matchmaker/MatchmakerRewardPanel";

export default function MatchmakerPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="font-heading text-3xl font-bold text-foreground">Matchmaker</h1>
      <p className="text-muted-foreground text-sm mt-2 max-w-prose">
        Pair people whose preferences match in both directions. SPARK and fee tiers scale with mutual fit;
        expected profit falls off quickly when fit drops because successful-date odds are modeled much
        tighter than linear.
      </p>
      <div className="mt-8">
        <MatchmakerRewardPanel />
      </div>
    </div>
  );
}
