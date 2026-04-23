/**
 * Stress / sequence tests for core demo flows — catches leaks and ordering bugs in stores.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { evaluateAchievements, getDemoAchievementSignals } from "@/lib/achievements";
import { MATCH_PROFILES } from "@/lib/matching-data";
import { listMutualPairs, pairKeyForProfiles, sparkRewardForMutualFit, tryRecordSuccessfulIntro } from "@/lib/matchmaker";
import { addSpark, getSparkBalance, setSparkBalance } from "@/lib/spark";
import { proposeAndLock, resolveStake, getActiveStake } from "@/lib/stake/stakeManager";
import { DEMO_LOCAL_USER_ID } from "@/lib/stake/session";
import { applyGhostOutcome, getGhostScore, setGhostScore, type GhostOutcome } from "@/lib/ghost-score";
import { resetAllDemoStores } from "@/lib/testing/resetDemoSession";

describe("core flows (stress)", () => {
  beforeEach(() => {
    resetAllDemoStores();
  });

  afterEach(() => {
    resetAllDemoStores();
  });

  it("sequential stakes: many lock → resolve cycles stay consistent", async () => {
    const self = { id: DEMO_LOCAL_USER_ID, displayName: "Me", ghostScore: 8 };
    for (let i = 0; i < 6; i++) {
      const peer = { id: `peer-${i}`, displayName: `Peer ${i}`, ghostScore: 10 };
      const stake = await proposeAndLock(15, [self, peer]);
      expect(stake.status).toBe("locked");
      expect(getActiveStake()?.id).toBe(stake.id);
      await resolveStake(stake.id, "SUCCESS", undefined, DEMO_LOCAL_USER_ID);
      expect(getActiveStake()).toBeNull();
    }
    expect(getGhostScore()).toBeGreaterThanOrEqual(0);
    expect(getGhostScore()).toBeLessThanOrEqual(100);
  });

  it("matchmaker: many unique pair intros without double-counting", () => {
    const pairs = listMutualPairs(MATCH_PROFILES);
    expect(pairs.length).toBeGreaterThan(0);
    let credited = 0;
    let sparkAdded = 0;
    const start = getSparkBalance();
    for (const p of pairs) {
      const key = pairKeyForProfiles(p.a, p.b);
      if (tryRecordSuccessfulIntro(key)) {
        credited += 1;
        const s = sparkRewardForMutualFit(p.mutualScore);
        addSpark(s);
        sparkAdded += s;
      }
    }
    expect(credited).toBe(pairs.length);
    expect(getSparkBalance()).toBe(start + sparkAdded);
    for (const p of pairs) {
      expect(tryRecordSuccessfulIntro(pairKeyForProfiles(p.a, p.b))).toBe(false);
    }
  });

  it("ghost outcomes: chained applyGhostOutcome stays in range", () => {
    setGhostScore(20);
    const cycle: GhostOutcome[] = ["SHOWED_UP", "FLAKED", "DISPUTED", "CANCELLED_EARLY"];
    for (let i = 0; i < 40; i++) {
      applyGhostOutcome(cycle[i % cycle.length]!);
    }
    const g = getGhostScore();
    expect(g).toBeGreaterThanOrEqual(0);
    expect(g).toBeLessThanOrEqual(100);
  });

  it("achievement evaluation does not throw under repeated evaluation", () => {
    setGhostScore(12);
    setSparkBalance(10_000);
    for (let i = 0; i < 50; i++) {
      const sig = getDemoAchievementSignals(8 + (i % 20), true, {
        successfulMatchmakerIntros: Math.min(3, i % 4),
      });
      const ev = evaluateAchievements(sig);
      expect(ev.unlocked.length + ev.upcoming.length).toBeGreaterThan(0);
    }
  });
});
