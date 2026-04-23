import { MATCH_PROFILES, MATCH_USER_PREFERENCES, type MatchPreferences, type MatchProfile } from "@/lib/matching-data";
import { scoreProfile, type MatchReason, type ScoredMatch } from "@/lib/matching-score";

export type { MatchReason, ScoredMatch };
export { scoreProfile };

export function getRankedMatches(
  profiles: readonly MatchProfile[] = MATCH_PROFILES,
  preferences: MatchPreferences = MATCH_USER_PREFERENCES,
) {
  return profiles.map((profile) => scoreProfile(profile, preferences)).sort((a, b) => b.score - a.score);
}

export const MATCHED_PROFILES = getRankedMatches();
export const DEFAULT_MATCH = MATCHED_PROFILES[0]!;

export function getScoredMatchByProfileId(profileId: number): ScoredMatch | undefined {
  return MATCHED_PROFILES.find((m) => m.profile.id === profileId);
}
