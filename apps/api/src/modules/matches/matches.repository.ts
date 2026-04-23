import { demoMatches, demoProfiles } from "../demo-data.js";
import type { UnmatchRequest } from "./matches.schemas.js";

export class MatchesRepository {
  private readonly removed = new Map<string, UnmatchRequest & { userId: string; removedAt: string }>();

  listMatches() {
    return demoMatches
      .filter((match) => !this.removed.has(match.id))
      .map((match) => ({
        ...match,
        profile: demoProfiles.find((profile) => profile.id === match.profileId)
      }));
  }

  listLikesYou() {
    return demoProfiles.map((profile) => ({
      profile,
      likedAt: new Date(Date.now() - profile.ghostScore * 60_000).toISOString(),
      premiumLocked: false
    }));
  }

  unmatch(userId: string, matchId: string, input: UnmatchRequest) {
    const record = {
      ...input,
      userId,
      removedAt: new Date().toISOString()
    };
    this.removed.set(matchId, record);
    return {
      matchId,
      ...record
    };
  }
}
