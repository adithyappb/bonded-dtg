import { describe, expect, it } from "vitest";
import { GHOST_DELTA, GHOST_SCORE_MAX, GHOST_SCORE_MIN, clampGhostScore, ghostRiskLabel, nextGhostScore } from "./ghostScore";
import type { GhostOutcome } from "./types";

const ALL_OUTCOMES: GhostOutcome[] = ["SHOWED_UP", "FLAKED", "DISPUTED", "CANCELLED_EARLY"];

describe("ghostScore pure logic", () => {
  it("every outcome changes score by GHOST_DELTA and stays in bounds", () => {
    for (const o of ALL_OUTCOMES) {
      const t = nextGhostScore(50, o);
      expect(t.delta).toBe(GHOST_DELTA[o]);
      expect(t.newScore).toBeGreaterThanOrEqual(GHOST_SCORE_MIN);
      expect(t.newScore).toBeLessThanOrEqual(GHOST_SCORE_MAX);
      expect(t.prevScore).toBe(50);
    }
  });

  it("treats non-finite prev as 0", () => {
    const t = nextGhostScore(undefined, "FLAKED");
    expect(t.prevScore).toBe(0);
  });

  it("clamps at ceiling for heavy FLAKED streak", () => {
    expect(nextGhostScore(99, "FLAKED").newScore).toBe(GHOST_SCORE_MAX);
  });

  it("clamps at floor for SHOWED_UP from low score", () => {
    expect(nextGhostScore(1, "SHOWED_UP").newScore).toBeGreaterThanOrEqual(GHOST_SCORE_MIN);
  });

  it("clampGhostScore is idempotent within range", () => {
    expect(clampGhostScore(50)).toBe(50);
    expect(clampGhostScore(-1)).toBe(0);
    expect(clampGhostScore(101)).toBe(100);
  });

  it("ghostRiskLabel bands cover 0–100", () => {
    expect(ghostRiskLabel(0).band).toBe("excellent");
    expect(ghostRiskLabel(24).band).toBe("medium");
    expect(ghostRiskLabel(100).band).toBe("high");
  });
});
