import { randomUUID } from "node:crypto";
import { demoProfiles } from "../demo-data.js";
import type { RecommendationRequest } from "./matchmaker.schemas.js";

export class MatchmakerRepository {
  private readonly recommendations: Array<RecommendationRequest & { id: string; status: string }> = [];

  listCandidates() {
    return demoProfiles;
  }

  createRecommendation(input: RecommendationRequest) {
    const recommendation = {
      id: randomUUID(),
      status: "pending_acceptance",
      ...input
    };
    this.recommendations.push(recommendation);
    return recommendation;
  }

  rewards() {
    return {
      pendingWei: "6000000000000000",
      acceptedIntroductions: this.recommendations.length,
      claimableWei: "0"
    };
  }
}
