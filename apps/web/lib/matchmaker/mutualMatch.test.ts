import { describe, expect, it } from "vitest";
import { MATCH_PROFILES } from "@/lib/matching-data";
import { computeMutualPair, listMutualPairs, pairKeyForProfiles } from "./mutualMatch";

describe("mutualMatch", () => {
  it("pairKeyForProfiles is stable regardless of argument order", () => {
    const a = MATCH_PROFILES[0]!;
    const b = MATCH_PROFILES[1]!;
    expect(pairKeyForProfiles(a, b)).toBe(pairKeyForProfiles(b, a));
  });

  it("computeMutualPair is symmetric in mutualScore when preferences align", () => {
    const a = MATCH_PROFILES[0]!;
    const b = MATCH_PROFILES[1]!;
    const ab = computeMutualPair(a, b);
    const ba = computeMutualPair(b, a);
    expect(ab.mutualScore).toBe(ba.mutualScore);
    expect(ab.fitFromAPerspective).toBe(ba.fitFromBPerspective);
    expect(ab.fitFromBPerspective).toBe(ba.fitFromAPerspective);
  });

  it("listMutualPairs returns sorted pairs by mutualScore descending", () => {
    const pairs = listMutualPairs(MATCH_PROFILES, 0);
    for (let i = 1; i < pairs.length; i++) {
      expect(pairs[i - 1]!.mutualScore).toBeGreaterThanOrEqual(pairs[i]!.mutualScore);
    }
    expect(pairs.length).toBeGreaterThan(0);
  });
});
