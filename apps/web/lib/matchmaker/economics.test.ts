import { describe, expect, it } from "vitest";
import { MATCHMAKER_SPARK_MAX, MATCHMAKER_USDC_SUCCESS_FEE_PCT, MUTUAL_FIT_SCALE } from "./constants";
import {
  effectiveUsdcFeePercent,
  modeledSuccessPercent,
  sparkRewardForMutualFit,
} from "./economics";

describe("matchmaker economics", () => {
  it("SPARK is directly proportional to mutual fit (linear)", () => {
    expect(sparkRewardForMutualFit(0)).toBe(1);
    expect(sparkRewardForMutualFit(MUTUAL_FIT_SCALE)).toBe(MATCHMAKER_SPARK_MAX);
    expect(sparkRewardForMutualFit(50)).toBe(Math.max(1, Math.round((MATCHMAKER_SPARK_MAX * 50) / MUTUAL_FIT_SCALE)));
  });

  it("USDC fee % scales linearly with mutual fit", () => {
    expect(effectiveUsdcFeePercent(MUTUAL_FIT_SCALE)).toBe(MATCHMAKER_USDC_SUCCESS_FEE_PCT);
    expect(effectiveUsdcFeePercent(0)).toBe(0);
  });

  it("modeled success % drops sharply vs fit (quadratic)", () => {
    expect(modeledSuccessPercent(MUTUAL_FIT_SCALE)).toBe(100);
    expect(modeledSuccessPercent(50)).toBe(Math.round(100 * (50 / MUTUAL_FIT_SCALE) ** 2));
    expect(modeledSuccessPercent(25)).toBeLessThan(modeledSuccessPercent(50));
  });
});
