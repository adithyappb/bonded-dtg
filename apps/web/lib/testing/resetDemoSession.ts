import { setGhostScore } from "@/lib/ghost-score";
import { resetStakeManagerForTesting } from "@/lib/stake/stakeManager";
import { DEMO_SPARK_BALANCE, setSparkBalance } from "@/lib/spark";
import { resetMatchmakerStats } from "@/lib/matchmaker";
import { resetMeetVerificationStore } from "@/lib/trust/meetVerificationStore";

/**
 * Resets in-memory demo stores so integration tests and manual QA start from a known baseline.
 * Does not touch localStorage (e.g. swipe counts) — clear that in tests if needed.
 */
export function resetAllDemoStores(): void {
  setGhostScore(8);
  setSparkBalance(DEMO_SPARK_BALANCE);
  resetMatchmakerStats();
  resetMeetVerificationStore();
  resetStakeManagerForTesting();
}
