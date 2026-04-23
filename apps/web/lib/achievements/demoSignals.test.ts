import { afterEach, describe, expect, it } from "vitest";
import { evaluateAchievements } from "./engine";
import { getDemoAchievementSignals } from "./demoSignals";
import { setGhostScore } from "@/lib/ghost-score";

describe("getDemoAchievementSignals", () => {
  afterEach(() => {
    setGhostScore(8);
  });

  it("feeds evaluateAchievements without throwing", () => {
    const signals = getDemoAchievementSignals();
    const ev = evaluateAchievements(signals);
    expect(ev.unlocked.length + ev.upcoming.length).toBeGreaterThan(0);
  });

  it("ghost override changes signals and caution unlock", () => {
    const low = getDemoAchievementSignals(8);
    const high = getDemoAchievementSignals(50);
    expect(high.ghostScore).toBe(50);
    expect(low.ghostScore).toBe(8);
    const evHigh = evaluateAchievements(high);
    expect(evHigh.unlocked.some((u) => u.definition.id === "caution_reliability_dip")).toBe(true);
  });

  it("wallet flag affects trust score embedded in signals", () => {
    const on = getDemoAchievementSignals(8, true);
    const off = getDemoAchievementSignals(8, false);
    expect(off.trustScore).toBeLessThanOrEqual(on.trustScore);
  });
});
