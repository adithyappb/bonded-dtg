import { demoAchievements } from "../demo-data.js";
import type { ProofRequest } from "./achievements.schemas.js";

export class AchievementsRepository {
  catalog() {
    return demoAchievements;
  }

  mine() {
    return demoAchievements.filter((achievement) => achievement.earned);
  }

  requestProof(input: ProofRequest) {
    return {
      ...input,
      status: "queued",
      requestedAt: new Date().toISOString()
    };
  }
}
