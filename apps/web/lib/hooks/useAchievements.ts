"use client";

import { useMemo } from "react";
import { evaluateAchievements, getDemoAchievementSignals } from "@/lib/achievements";
import { useGhostScore } from "@/lib/ghost-score";
import { useSuccessfulMatchmakerIntros } from "@/lib/matchmaker";
import { useWallet } from "@/lib/wallet";

export function useAchievementEvaluation() {
  const ghost = useGhostScore();
  const { status } = useWallet();
  const matchmakerIntros = useSuccessfulMatchmakerIntros();
  return useMemo(
    () =>
      evaluateAchievements(
        getDemoAchievementSignals(ghost, status === "connected", {
          successfulMatchmakerIntros: matchmakerIntros,
        }),
      ),
    [ghost, status, matchmakerIntros],
  );
}
