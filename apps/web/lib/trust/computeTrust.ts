import type { TrustInputs, TrustResult, TrustTier } from "./types";

function tierFromScore(score: number): TrustTier {
  if (score >= 82) return "solid";
  if (score >= 68) return "trusted";
  if (score >= 52) return "building";
  return "review";
}

/**
 * Composite trust for “is this person legit / solid” — combines identity,
 * wallet presence, meet verification, reliability, and inverse Ghost risk.
 */
export function computeTrustScore(input: TrustInputs): TrustResult {
  const factors: TrustResult["factors"] = [];
  let score = 38;

  if (input.verifiedHuman) {
    factors.push({
      label: "Verified identity",
      points: 18,
      detail: "Proof-of-personhood attestation on file.",
    });
    score += 18;
  } else {
    factors.push({
      label: "Verified identity",
      points: 0,
      detail: "Not verified — complete World ID or equivalent to unlock full trust.",
    });
  }

  if (input.walletConnected) {
    factors.push({ label: "Wallet connected", points: 6, detail: "Address-bound session for stakes and attestations." });
    score += 6;
  } else {
    factors.push({ label: "Wallet connected", points: 0, detail: "Connect a wallet to anchor activity on-chain." });
  }

  if (input.mutualMeetConfirmed) {
    factors.push({
      label: "Mutual meet proof",
      points: 12,
      detail: "At least one date where both parties confirmed an in-person meet.",
    });
    score += 12;
  } else {
    factors.push({
      label: "Mutual meet proof",
      points: 0,
      detail: "Confirm a completed date with your match to strengthen legitimacy.",
    });
  }

  const totalDates = input.datesCompleted + input.forfeitedStakes;
  if (totalDates > 0) {
    const rel = input.datesCompleted / totalDates;
    const pts = Math.round(rel * 20);
    factors.push({
      label: "Stake follow-through",
      points: pts,
      detail: `${input.datesCompleted} completed vs ${input.forfeitedStakes} forfeited staked dates.`,
    });
    score += pts;
  } else {
    factors.push({
      label: "Stake follow-through",
      points: 0,
      detail: "No staked date history yet — first completion unlocks this signal.",
    });
  }

  const ghost = Math.max(0, Math.min(100, input.ghostScore));
  const ghostPts = Math.round((100 - ghost) * 0.22);
  factors.push({
    label: "Reliability (inverse Ghost)",
    points: ghostPts,
    detail: `Ghost ${ghost} — lower is better; improves as you show up consistently.`,
  });
  score += ghostPts;

  score = Math.max(0, Math.min(100, score));

  const tier = tierFromScore(score);
  const summary =
    tier === "solid"
      ? "Solid trust — verification + behavior align."
      : tier === "trusted"
        ? "Trusted — a few more verified meets will harden your profile."
        : tier === "building"
          ? "Building — keep completing staked dates and mutual confirmations."
          : "Needs reinforcement — prioritize verified identity and follow-through.";

  return { score, tier, factors, summary };
}

export function trustTierLabel(tier: TrustTier): string {
  switch (tier) {
    case "solid":
      return "Solid";
    case "trusted":
      return "Trusted";
    case "building":
      return "Building";
    default:
      return "Review";
  }
}
