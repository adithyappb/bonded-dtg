import { scoreProfile } from "@/lib/matching-score";
import type { MatchProfile } from "@/lib/matching-data";
import { MUTUAL_MATCH_MIN_SCORE } from "./constants";

export type MutualPair = {
  a: MatchProfile;
  b: MatchProfile;
  /** How well B fits A’s stated preferences. */
  fitFromAPerspective: number;
  /** How well A fits B’s stated preferences. */
  fitFromBPerspective: number;
  /** Geometric mean of both directions — both sides must be aligned for a high score. */
  mutualScore: number;
};

function pairKey(aId: number, bId: number): string {
  return aId < bId ? `${aId}-${bId}` : `${bId}-${aId}`;
}

/**
 * Two-way compatibility: score each profile against the other’s preferences.
 * Uses a geometric mean so one-sided fits cannot masquerade as a mutual match.
 */
export function computeMutualPair(a: MatchProfile, b: MatchProfile): MutualPair {
  const fitA = scoreProfile(b, a.preferences).score;
  const fitB = scoreProfile(a, b.preferences).score;
  const mutualScore = Math.round(Math.sqrt(Math.max(1, fitA) * Math.max(1, fitB)));
  return { a, b, fitFromAPerspective: fitA, fitFromBPerspective: fitB, mutualScore };
}

export function listMutualPairs(
  profiles: readonly MatchProfile[],
  minScore: number = MUTUAL_MATCH_MIN_SCORE,
): MutualPair[] {
  const out: MutualPair[] = [];
  for (let i = 0; i < profiles.length; i++) {
    for (let j = i + 1; j < profiles.length; j++) {
      const a = profiles[i]!;
      const b = profiles[j]!;
      const pair = computeMutualPair(a, b);
      if (pair.mutualScore >= minScore) {
        out.push(pair);
      }
    }
  }
  return out.sort((x, y) => y.mutualScore - x.mutualScore);
}

export function pairKeyForProfiles(a: MatchProfile, b: MatchProfile): string {
  return pairKey(a.id, b.id);
}
