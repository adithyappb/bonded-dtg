import { describe, expect, it } from "vitest";
import { computeTrustScore, trustTierLabel } from "./computeTrust";

describe("computeTrustScore", () => {
  it("produces solid tier for strong verified + low ghost", () => {
    const r = computeTrustScore({
      ghostScore: 5,
      verifiedHuman: true,
      walletConnected: true,
      mutualMeetConfirmed: true,
      datesCompleted: 20,
      forfeitedStakes: 0,
    });
    expect(r.score).toBeGreaterThanOrEqual(82);
    expect(r.tier).toBe("solid");
    expect(trustTierLabel(r.tier)).toBe("Solid");
  });

  it("down-weights high ghost", () => {
    const low = computeTrustScore({
      ghostScore: 10,
      verifiedHuman: true,
      walletConnected: true,
      mutualMeetConfirmed: true,
      datesCompleted: 10,
      forfeitedStakes: 0,
    });
    const high = computeTrustScore({
      ghostScore: 80,
      verifiedHuman: true,
      walletConnected: true,
      mutualMeetConfirmed: true,
      datesCompleted: 10,
      forfeitedStakes: 0,
    });
    expect(high.score).toBeLessThan(low.score);
  });

  it("score is always 0–100", () => {
    const extreme = computeTrustScore({
      ghostScore: 100,
      verifiedHuman: false,
      walletConnected: false,
      mutualMeetConfirmed: false,
      datesCompleted: 0,
      forfeitedStakes: 0,
    });
    expect(extreme.score).toBeGreaterThanOrEqual(0);
    expect(extreme.score).toBeLessThanOrEqual(100);
  });

  it("tier labels map to four buckets", () => {
    const r = computeTrustScore({
      ghostScore: 50,
      verifiedHuman: true,
      walletConnected: true,
      mutualMeetConfirmed: false,
      datesCompleted: 4,
      forfeitedStakes: 1,
    });
    expect(["solid", "trusted", "building", "review"]).toContain(r.tier);
  });

  it("wallet off removes 6 points when score is below cap", () => {
    const on = computeTrustScore({
      ghostScore: 100,
      verifiedHuman: true,
      walletConnected: true,
      mutualMeetConfirmed: true,
      datesCompleted: 1,
      forfeitedStakes: 0,
    });
    const off = computeTrustScore({
      ghostScore: 100,
      verifiedHuman: true,
      walletConnected: false,
      mutualMeetConfirmed: true,
      datesCompleted: 1,
      forfeitedStakes: 0,
    });
    expect(off.score).toBe(on.score - 6);
  });

  it("factors always include five conceptual rows", () => {
    const r = computeTrustScore({
      ghostScore: 20,
      verifiedHuman: true,
      walletConnected: true,
      mutualMeetConfirmed: false,
      datesCompleted: 3,
      forfeitedStakes: 1,
    });
    expect(r.factors).toHaveLength(5);
    expect(r.summary.length).toBeGreaterThan(10);
  });

  it("ghost clamped in factor detail for extreme input", () => {
    const r = computeTrustScore({
      ghostScore: 999,
      verifiedHuman: true,
      walletConnected: true,
      mutualMeetConfirmed: true,
      datesCompleted: 1,
      forfeitedStakes: 0,
    });
    expect(r.factors.some((f) => f.label.includes("Ghost"))).toBe(true);
    expect(r.score).toBeLessThanOrEqual(100);
  });
});
