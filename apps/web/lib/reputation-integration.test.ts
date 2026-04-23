/**
 * Cross-module consistency: ghost → trust → achievements react to the same inputs.
 */
import { afterEach, describe, expect, it } from "vitest";
import { evaluateAchievements, getDemoAchievementSignals } from "@/lib/achievements";
import { DEMO_REPUTATION } from "@/lib/demo-reputation";
import { setGhostScore } from "@/lib/ghost-score/ghostScoreStore";
import { computeTrustScore } from "@/lib/trust";

describe("reputation integration (demo signals)", () => {
  afterEach(() => {
    setGhostScore(8);
  });

  it("raising ghost lowers trust and can unlock caution NFT", () => {
    setGhostScore(8);
    const trustLowGhost = computeTrustScore({
      ghostScore: 8,
      verifiedHuman: DEMO_REPUTATION.verifiedHuman,
      walletConnected: true,
      mutualMeetConfirmed: DEMO_REPUTATION.mutualMeetConfirmations >= 1,
      datesCompleted: DEMO_REPUTATION.datesCompleted,
      forfeitedStakes: DEMO_REPUTATION.forfeitedStakes,
    });

    setGhostScore(95);
    const trustHighGhost = computeTrustScore({
      ghostScore: 95,
      verifiedHuman: DEMO_REPUTATION.verifiedHuman,
      walletConnected: true,
      mutualMeetConfirmed: DEMO_REPUTATION.mutualMeetConfirmations >= 1,
      datesCompleted: DEMO_REPUTATION.datesCompleted,
      forfeitedStakes: DEMO_REPUTATION.forfeitedStakes,
    });

    expect(trustHighGhost.score).toBeLessThan(trustLowGhost.score);

    const signalsBad = getDemoAchievementSignals(95, true);
    const ev = evaluateAchievements(signalsBad);
    expect(ev.unlocked.some((u) => u.definition.id === "caution_reliability_dip")).toBe(true);
  });

  it("trust_anchor achievement aligns with trust score threshold", () => {
    const signals = getDemoAchievementSignals(8, true);
    if (signals.trustScore >= 80) {
      expect(evaluateAchievements(signals).unlocked.map((u) => u.definition.id)).toContain("trust_anchor");
    }
  });
});
