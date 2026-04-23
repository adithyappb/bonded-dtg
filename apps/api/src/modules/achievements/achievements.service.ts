import type { ProofRequest } from "./achievements.schemas.js";
import { AchievementsRepository } from "./achievements.repository.js";

export class AchievementsService {
  constructor(private readonly achievements = new AchievementsRepository()) {}

  catalog() {
    return {
      achievements: this.achievements.catalog()
    };
  }

  mine() {
    return {
      achievements: this.achievements.mine()
    };
  }

  requestProof(input: ProofRequest) {
    return this.achievements.requestProof(input);
  }
}
