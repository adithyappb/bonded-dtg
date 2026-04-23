import { getGhostScore } from "@/lib/ghost-score";
import { DEMO_REPUTATION } from "@/lib/demo-reputation";
import { computeTrustScore } from "@/lib/trust";
import type { AchievementSignals } from "./engine";

export function getDemoAchievementSignals(
  ghostScoreOverride?: number,
  walletConnected: boolean = true,
  extras?: Partial<Pick<AchievementSignals, "successfulMatchmakerIntros">>,
): AchievementSignals {
  const ghostScore = ghostScoreOverride ?? getGhostScore();
  const trust = computeTrustScore({
    ghostScore,
    verifiedHuman: DEMO_REPUTATION.verifiedHuman,
    walletConnected,
    mutualMeetConfirmed: DEMO_REPUTATION.mutualMeetConfirmations >= 1,
    datesCompleted: DEMO_REPUTATION.datesCompleted,
    forfeitedStakes: DEMO_REPUTATION.forfeitedStakes,
  });

  return {
    datesCompleted: DEMO_REPUTATION.datesCompleted,
    reliableStreak: DEMO_REPUTATION.reliableStreak,
    totalStakedUsdc: DEMO_REPUTATION.totalStakedUsdc,
    forfeitedStakes: DEMO_REPUTATION.forfeitedStakes,
    ghostScore,
    mutualMeetConfirmations: DEMO_REPUTATION.mutualMeetConfirmations,
    disputesCount: DEMO_REPUTATION.disputesCount,
    successfulMatchmakerIntros:
      extras?.successfulMatchmakerIntros ?? DEMO_REPUTATION.successfulMatchmakerIntros,
    trustScore: trust.score,
  };
}
