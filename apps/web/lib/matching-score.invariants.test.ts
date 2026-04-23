import { describe, expect, it } from "vitest";
import { MATCH_PROFILES, MATCH_USER_PREFERENCES } from "@/lib/matching-data";
import { scoreProfile } from "./matching-score";

describe("scoreProfile invariants", () => {
  it("always returns 0–99 inclusive", () => {
    for (const p of MATCH_PROFILES) {
      const s = scoreProfile(p, MATCH_USER_PREFERENCES);
      expect(s.score).toBeGreaterThanOrEqual(0);
      expect(s.score).toBeLessThanOrEqual(99);
      expect(s.reasons.length).toBeLessThanOrEqual(3);
    }
  });
});
