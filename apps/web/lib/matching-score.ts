import type { MatchPreferences, MatchProfile } from "@/lib/matching-data";

export type MatchReason = {
  label: string;
  detail: string;
  weight: number;
};

export type ScoredMatch = {
  profile: MatchProfile;
  score: number;
  sharedInterests: string[];
  alignedValues: string[];
  reasons: MatchReason[];
  flags: string[];
};

function normalizeScore(score: number) {
  return Math.max(0, Math.min(99, Math.round(score)));
}

/** Pure scoring — safe to import from matchmaker without pulling in `matching.ts` graph. */
export function scoreProfile(profile: MatchProfile, preferences: MatchPreferences): ScoredMatch {
  const sharedInterests = profile.interests.filter((interest) => preferences.interests.includes(interest));
  const alignedValues = profile.values.filter((value) => preferences.values.includes(value));
  const inAgeRange = profile.age >= preferences.ageMin && profile.age <= preferences.ageMax;
  const intentAligned = preferences.preferredIntent.includes(profile.intent);
  
  // Robustness: normalize dealbreakers and traits for safer comparison
  const normalize = (s: string) => s.toLowerCase().trim().replace(/ing$/, "");
  const normalizedTraits = (profile.traits || []).map(normalize);
  const normalizedBreakers = (preferences.dealbreakers || []).map(normalize);
  
  const hasDealbreaker = normalizedTraits.some((trait) =>
    normalizedBreakers.some((breaker) => trait.includes(breaker)),
  );

  const reasons: MatchReason[] = [];
  let rawScore = 20;

  if (inAgeRange) {
    rawScore += 18;
    reasons.push({ label: "Age fit", detail: "Within your current range.", weight: 18 });
  }

  if (sharedInterests.length > 0) {
    const weight = Math.min(24, sharedInterests.length * 8);
    rawScore += weight;
    reasons.push({ label: "Shared interests", detail: sharedInterests.join(", "), weight });
  }

  if (alignedValues.length > 0) {
    const weight = Math.min(18, alignedValues.length * 6);
    rawScore += weight;
    reasons.push({ label: "Aligned values", detail: alignedValues.join(", "), weight });
  }

  if (intentAligned) {
    rawScore += 10;
    reasons.push({ label: "Dating intent", detail: profile.intent, weight: 10 });
  }

  const trustWeight = Math.round(profile.trustScore / 8);
  rawScore += trustWeight;
  reasons.push({
    label: "Bonded trust",
    detail: `${profile.trustScore} trust score with ${profile.responseRate}% response reliability.`,
    weight: trustWeight,
  });

  if (profile.verifiedHuman) {
    rawScore += 6;
    reasons.push({ label: "Verified human", detail: "Identity check already passed.", weight: 6 });
  }

  if (hasDealbreaker) {
    rawScore -= 40;
  }

  return {
    profile,
    score: normalizeScore(rawScore),
    sharedInterests,
    alignedValues,
    reasons: reasons.sort((a, b) => b.weight - a.weight).slice(0, 3),
    flags: [
      profile.verifiedHuman ? "Verified Human" : "Unverified",
      `${profile.responseRate}% reply rate`,
      profile.traits[0] ?? "Profile complete",
    ],
  };
}
