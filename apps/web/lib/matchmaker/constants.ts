/**
 * Max SPARK when mutual fit is at the top of the 0–99 scoring band (directly proportional below).
 * @see `sparkRewardForMutualFit` in `./economics`.
 */
export const MATCHMAKER_SPARK_MAX = 35;

/** @deprecated Use MATCHMAKER_SPARK_MAX — per-intro SPARK now scales with mutual fit. */
export const MATCHMAKER_SPARK_PER_INTRO = MATCHMAKER_SPARK_MAX;

/** Upper bound of the mutual-fit score returned by the matcher (normalization scale). */
export const MUTUAL_FIT_SCALE = 99;

/** Minimum geometric-mean fit score (0–99) for a pair to appear as matchmaker-suggested. */
export const MUTUAL_MATCH_MIN_SCORE = 52;

/** Base USDC success-fee % at perfect mutual fit (scaled down with fit; see `effectiveUsdcFeePercent`). */
export const MATCHMAKER_USDC_SUCCESS_FEE_PCT = 2;
