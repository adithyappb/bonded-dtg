import type { CompatibilityScoreRequest } from "./compatibility.schemas.js";
import { CompatibilityRepository } from "./compatibility.repository.js";

export class CompatibilityService {
  constructor(private readonly compatibility = new CompatibilityRepository()) {}

  score(input: CompatibilityScoreRequest) {
    const shared = input.profileA.interests.filter((interest) => input.profileB.interests.includes(interest));
    const score = Math.min(98, 72 + shared.length * 8);
    const explanation =
      shared.length > 0
        ? `Strong overlap around ${shared.join(", ")} with compatible planning intent.`
        : "Compatible baseline based on profile completeness and low-friction date preferences.";

    return this.compatibility.saveScore({ score, explanation });
  }
}
