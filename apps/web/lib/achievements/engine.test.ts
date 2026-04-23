import { describe, expect, it } from "vitest";
import { ACHIEVEMENT_CATALOG } from "./definitions";
import { evaluateAchievements, type AchievementSignals } from "./engine";

const base: AchievementSignals = {
  datesCompleted: 14,
  reliableStreak: 14,
  totalStakedUsdc: 450,
  forfeitedStakes: 1,
  ghostScore: 8,
  mutualMeetConfirmations: 3,
  disputesCount: 0,
  successfulMatchmakerIntros: 0,
  trustScore: 90,
};

describe("evaluateAchievements", () => {
  it("catalog ids referenced by engine are exhaustive", () => {
    const ids = new Set(ACHIEVEMENT_CATALOG.map((d) => d.id));
    const required = [
      "first_staked_date",
      "reliable_chain_5",
      "reliable_chain_10",
      "mutual_meet_bond",
      "stake_volume_diamond",
      "trust_anchor",
      "matchmaker_cupid",
      "caution_reliability_dip",
      "caution_forfeit",
      "caution_dispute",
    ];
    for (const r of required) {
      expect(ids.has(r), `missing ${r}`).toBe(true);
    }
  });

  it("unlocks milestones and caution NFTs independently", () => {
    const { unlocked } = evaluateAchievements(base);
    const ids = unlocked.map((u) => u.definition.id);
    expect(ids).toContain("first_staked_date");
    expect(ids).toContain("reliable_chain_10");
    expect(ids).toContain("caution_forfeit");
    expect(ids).not.toContain("caution_reliability_dip");
    expect(ids).not.toContain("stake_volume_diamond");
  });

  it("unlocks rough patch when ghost is high", () => {
    const { unlocked } = evaluateAchievements({ ...base, ghostScore: 45 });
    expect(unlocked.map((u) => u.definition.id)).toContain("caution_reliability_dip");
  });

  it("unlocks dispute caution when disputes > 0", () => {
    const { unlocked } = evaluateAchievements({ ...base, disputesCount: 2, ghostScore: 8 });
    expect(unlocked.map((u) => u.definition.id)).toContain("caution_dispute");
  });

  it("unlocks diamond at 1000+ staked volume", () => {
    const { unlocked } = evaluateAchievements({ ...base, totalStakedUsdc: 1000 });
    expect(unlocked.map((u) => u.definition.id)).toContain("stake_volume_diamond");
  });

  it("unlocks matchmaker cupid when at least one intro credited", () => {
    const { unlocked } = evaluateAchievements({ ...base, successfulMatchmakerIntros: 1 });
    expect(unlocked.map((u) => u.definition.id)).toContain("matchmaker_cupid");
  });

  it("caution badges never appear in upcoming (only unlocked when true)", () => {
    const { upcoming } = evaluateAchievements(base);
    expect(upcoming.every((u) => u.definition.tone !== "caution")).toBe(true);
  });

  it("upcoming is sorted by progress descending", () => {
    const { upcoming } = evaluateAchievements({
      ...base,
      totalStakedUsdc: 900,
      trustScore: 79,
    });
    for (let i = 1; i < upcoming.length; i++) {
      expect((upcoming[i - 1]!.progress ?? 0) >= (upcoming[i]!.progress ?? 0)).toBe(true);
    }
  });

  it("no duplicate unlocked ids", () => {
    const { unlocked } = evaluateAchievements(base);
    const ids = unlocked.map((u) => u.definition.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("caution NFTs include nudge copy", () => {
    for (const d of ACHIEVEMENT_CATALOG.filter((x) => x.tone === "caution")) {
      expect(d.nudge.length).toBeGreaterThan(10);
    }
  });
});
