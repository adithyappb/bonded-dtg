import type { GhostOutcome, GhostRiskLabel } from "./types";

/** Delta applied to ghost score (0–100, higher = worse). */
export const GHOST_DELTA: Record<GhostOutcome, number> = {
  SHOWED_UP: -3,
  FLAKED: 12,
  DISPUTED: 4,
  CANCELLED_EARLY: 2,
};

export const GHOST_SCORE_MIN = 0;
export const GHOST_SCORE_MAX = 100;

export interface GhostScoreTransition {
  prevScore: number;
  newScore: number;
  delta: number;
  outcome: GhostOutcome;
}

export function clampGhostScore(n: number): number {
  return Math.max(GHOST_SCORE_MIN, Math.min(GHOST_SCORE_MAX, n));
}

/** Pure: next score from previous numeric score and outcome. */
export function nextGhostScore(prev: number | undefined | null, outcome: GhostOutcome): GhostScoreTransition {
  const prevScore = typeof prev === "number" && Number.isFinite(prev) ? prev : 0;
  const delta = GHOST_DELTA[outcome];
  const newScore = clampGhostScore(prevScore + delta);
  return { prevScore, newScore, delta, outcome };
}

export function ghostRiskLabel(score: number): GhostRiskLabel {
  if (score < 10) return { label: "Highly reliable", band: "excellent" };
  if (score < 25) return { label: "Average risk", band: "medium" };
  return { label: "High risk", band: "high" };
}
