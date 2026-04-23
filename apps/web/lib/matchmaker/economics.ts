import {
  MATCHMAKER_SPARK_MAX,
  MATCHMAKER_USDC_SUCCESS_FEE_PCT,
  MUTUAL_FIT_SCALE,
} from "./constants";

/**
 * Demo SPARK payout — **linear in mutual fit**: at 99% fit you earn `MATCHMAKER_SPARK_MAX`, at half the fit
 * you earn half the SPARK (rounded). Aligns matchmaker upside with alignment quality.
 */
export function sparkRewardForMutualFit(mutualScore: number): number {
  const s = Math.max(0, Math.min(MUTUAL_FIT_SCALE, mutualScore));
  const raw = (MATCHMAKER_SPARK_MAX * s) / MUTUAL_FIT_SCALE;
  return Math.max(1, Math.round(raw));
}

/**
 * Protocol USDC success-fee % shown for this pair — **linear in mutual fit** (same proportionality as SPARK).
 */
export function effectiveUsdcFeePercent(mutualScore: number): number {
  const s = Math.max(0, Math.min(MUTUAL_FIT_SCALE, mutualScore));
  const raw = (MATCHMAKER_USDC_SUCCESS_FEE_PCT * s) / MUTUAL_FIT_SCALE;
  return Math.round(raw * 100) / 100;
}

/**
 * Modeled probability (0–1) that the intro leads to a completed, fee-generating date.
 * Uses **fit²** so small drops in mutual fit produce much lower odds — profitability falls off fast at the margin.
 */
export function modeledSuccessProbability(mutualScore: number): number {
  const t = Math.max(0, Math.min(1, mutualScore / MUTUAL_FIT_SCALE));
  return t * t;
}

/** Whole-percent success odds for UI (0–100). */
export function modeledSuccessPercent(mutualScore: number): number {
  return Math.round(100 * modeledSuccessProbability(mutualScore));
}
