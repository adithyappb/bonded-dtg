export type { GhostOutcome, GhostRiskBand, GhostRiskLabel } from "./types";
export {
  GHOST_DELTA,
  GHOST_SCORE_MIN,
  GHOST_SCORE_MAX,
  clampGhostScore,
  nextGhostScore,
  ghostRiskLabel,
  type GhostScoreTransition,
} from "./ghostScore";
export {
  getGhostScore,
  setGhostScore,
  subscribeGhostScore,
  applyGhostOutcome,
  applyGhostUpdatesForLocalUser,
  useGhostScore,
} from "./ghostScoreStore";
