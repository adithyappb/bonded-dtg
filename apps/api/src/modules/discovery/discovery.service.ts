import type { DiscoveryQuery, FiltersRequest, SwipeRequest } from "./discovery.schemas.js";
import { DiscoveryRepository } from "./discovery.repository.js";

export class DiscoveryService {
  constructor(private readonly discovery = new DiscoveryRepository()) {}

  getFeed(userId: string, query: DiscoveryQuery) {
    return {
      candidates: this.discovery.listCandidates(query),
      dailyLimit: this.discovery.getDailyLimit(userId)
    };
  }

  swipe(userId: string, input: SwipeRequest) {
    const swipe = this.discovery.recordSwipe(userId, input);

    return {
      swipe,
      matched: input.decision === "like" && input.profileId === "maya",
      dailyLimit: this.discovery.getDailyLimit(userId)
    };
  }

  updateFilters(userId: string, input: FiltersRequest) {
    return this.discovery.updateFilters(userId, input);
  }
}
