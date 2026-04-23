import { demoProfiles } from "../demo-data.js";
import type { DiscoveryQuery, FiltersRequest, SwipeRequest } from "./discovery.schemas.js";

export class DiscoveryRepository {
  private readonly swipes: Array<SwipeRequest & { userId: string; createdAt: string }> = [];
  private readonly filters = new Map<string, FiltersRequest>();

  listCandidates(query: DiscoveryQuery) {
    return demoProfiles.filter((profile) => profile.ghostScore <= query.maxGhostScore).slice(0, query.limit);
  }

  recordSwipe(userId: string, input: SwipeRequest) {
    const swipe = {
      ...input,
      userId,
      createdAt: new Date().toISOString()
    };
    this.swipes.push(swipe);
    return swipe;
  }

  updateFilters(userId: string, input: FiltersRequest) {
    this.filters.set(userId, input);
    return input;
  }

  getDailyLimit(userId: string) {
    const used = this.swipes.filter((swipe) => swipe.userId === userId).length;
    return {
      used,
      limit: 20,
      remaining: Math.max(0, 20 - used)
    };
  }
}
