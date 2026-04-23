import { describe, expect, it } from "vitest";
import { formatUsdc, FULL_ESCROW_USDC, STAKE_PER_SIDE_USDC } from "./constants";
import { expectedFullEscrow, payoutSummary, peerNeverFundedSummary } from "./stakeRules";

describe("stakeRules / constants", () => {
  it("expectedFullEscrow is 2× per side", () => {
    expect(expectedFullEscrow(STAKE_PER_SIDE_USDC)).toBe(FULL_ESCROW_USDC);
    expect(expectedFullEscrow(0.2)).toBeCloseTo(0.4, 5);
  });

  it("formatUsdc formats consistently", () => {
    expect(formatUsdc(15)).toMatch(/15/);
    expect(formatUsdc(30)).toMatch(/30/);
    expect(formatUsdc(NaN)).toMatch(/\$0/);
  });

  it("payoutSummary covers all StakeOutcome variants", () => {
    const s = payoutSummary("SUCCESS", 15, 30);
    expect(s).toContain("15");
    expect(s).toContain("30");

    const f = payoutSummary("FLAKED", 15, 30, { winnerLabel: "Alex", flakedLabel: "Sam" });
    expect(f).toContain("Alex");
    expect(f).toContain("Sam");
    expect(f).toContain("30");

    const d = payoutSummary("DISPUTED", 15, 30);
    expect(d).toContain("75%");
  });

  it("peerNeverFundedSummary includes payout and counterparty", () => {
    const t = peerNeverFundedSummary(15, 30, "Jordan");
    expect(t).toContain("Jordan");
    expect(t).toContain("30");
  });
});
