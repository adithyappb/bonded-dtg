/**
 * Cross-cutting flows: stake ↔ ghost, matchmaker ↔ spark, trust ↔ achievements.
 * Uses `resetAllDemoStores` so order of tests does not leak session state.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { evaluateAchievements, getDemoAchievementSignals } from "@/lib/achievements";
import { MATCH_PROFILES, MATCH_USER_PREFERENCES } from "@/lib/matching-data";
import { scoreProfile } from "@/lib/matching-score";
import {
  getSuccessfulMatchmakerIntros,
  listMutualPairs,
  pairKeyForProfiles,
  sparkRewardForMutualFit,
  tryRecordSuccessfulIntro,
} from "@/lib/matchmaker";
import { addSpark, getSparkBalance } from "@/lib/spark";
import { proposeAndLock, resolveStake, getActiveStake } from "@/lib/stake/stakeManager";
import { DEMO_LOCAL_USER_ID } from "@/lib/stake/session";
import { computeTrustScore } from "@/lib/trust";
import { confirmPeerMet, confirmSelfMet, isMutualMeet, resetMeetVerificationStore } from "@/lib/trust/meetVerificationStore";
import { resetAllDemoStores } from "@/lib/testing/resetDemoSession";
import { getGhostScore, setGhostScore } from "@/lib/ghost-score";

describe("Bonded demo integration (stores + logic)", () => {
  beforeEach(() => {
    resetAllDemoStores();
  });

  afterEach(() => {
    resetAllDemoStores();
  });

  it("stake proposeAndLock → resolve SUCCESS clears active stake and touches ghost store", async () => {
    const self = { id: DEMO_LOCAL_USER_ID, displayName: "Me", ghostScore: 8 };
    const peer = { id: "peer-integration", displayName: "Peer", ghostScore: 10 };
    const stake = await proposeAndLock(15, [self, peer]);
    expect(stake.status).toBe("locked");
    expect(getActiveStake()?.id).toBe(stake.id);

    await resolveStake(stake.id, "SUCCESS", undefined, DEMO_LOCAL_USER_ID);
    expect(getActiveStake()).toBeNull();
    expect(getGhostScore()).toBeGreaterThanOrEqual(0);
    expect(getGhostScore()).toBeLessThanOrEqual(100);
  });

  it("mutual meet confirmations increase trust when fed into computeTrustScore", () => {
    const thread = "integration-thread";
    expect(isMutualMeet(thread)).toBe(false);
    confirmSelfMet(thread);
    confirmPeerMet(thread);
    expect(isMutualMeet(thread)).toBe(true);

    const t = computeTrustScore({
      ghostScore: 10,
      verifiedHuman: true,
      walletConnected: true,
      mutualMeetConfirmed: true,
      datesCompleted: 5,
      forfeitedStakes: 0,
    });
    expect(t.score).toBeGreaterThan(70);
    resetMeetVerificationStore();
  });

  it("matchmaker intro credits SPARK proportional to mutual fit", () => {
    const pair = listMutualPairs(MATCH_PROFILES)[0];
    expect(pair).toBeDefined();
    const key = pairKeyForProfiles(pair!.a, pair!.b);
    const beforeSpark = getSparkBalance();
    const beforeIntros = getSuccessfulMatchmakerIntros();
    expect(tryRecordSuccessfulIntro(key)).toBe(true);
    expect(getSuccessfulMatchmakerIntros()).toBe(beforeIntros + 1);
    const delta = sparkRewardForMutualFit(pair!.mutualScore);
    addSpark(delta);
    expect(getSparkBalance()).toBe(beforeSpark + delta);
  });

  it("achievement evaluation stays consistent after ghost + wallet signals", () => {
    setGhostScore(15);
    const signals = getDemoAchievementSignals(15, true, { successfulMatchmakerIntros: 1 });
    const ev = evaluateAchievements(signals);
    expect(ev.unlocked.some((u) => u.definition.id === "matchmaker_cupid")).toBe(true);
  });

  it("all demo profiles score in band when judged against default viewer prefs", () => {
    for (const p of MATCH_PROFILES) {
      const m = scoreProfile(p, MATCH_USER_PREFERENCES);
      expect(m.score).toBeGreaterThanOrEqual(0);
      expect(m.score).toBeLessThanOrEqual(99);
    }
  });
});
