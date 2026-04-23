import { describe, expect, it } from "vitest";
import { SPARK_TICKER } from "./constants";
import { formatSparkAmount } from "./format";

describe("formatSparkAmount", () => {
  it("includes ticker", () => {
    expect(formatSparkAmount(2450)).toContain(SPARK_TICKER);
    expect(formatSparkAmount(2450)).toMatch(/2[,.]?450/);
  });

  it("handles invalid numbers as zero", () => {
    expect(formatSparkAmount(NaN)).toContain("0");
  });
});
