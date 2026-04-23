/**
 * Behavioral outcomes that adjust Ghost Score (higher = worse reputation).
 * Aligned with demo ghostScoreEngine.js
 */
export type GhostOutcome = "SHOWED_UP" | "FLAKED" | "DISPUTED" | "CANCELLED_EARLY";

export type GhostRiskBand = "excellent" | "medium" | "high";

export interface GhostRiskLabel {
  label: string;
  band: GhostRiskBand;
}
