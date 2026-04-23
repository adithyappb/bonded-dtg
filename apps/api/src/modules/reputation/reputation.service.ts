import { ReputationRepository } from "./reputation.repository.js";

export class ReputationService {
  constructor(private readonly reputation = new ReputationRepository()) {}

  getProfileReputation(profileId: string) {
    return this.reputation.getProfileReputation(profileId);
  }
}
