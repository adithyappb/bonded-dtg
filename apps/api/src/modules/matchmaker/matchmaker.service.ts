import type { RecommendationRequest } from "./matchmaker.schemas.js";
import { MatchmakerRepository } from "./matchmaker.repository.js";

export class MatchmakerService {
  constructor(private readonly matchmaker = new MatchmakerRepository()) {}

  candidates() {
    return {
      candidates: this.matchmaker.listCandidates()
    };
  }

  recommend(input: RecommendationRequest) {
    return this.matchmaker.createRecommendation(input);
  }

  rewards() {
    return this.matchmaker.rewards();
  }
}
