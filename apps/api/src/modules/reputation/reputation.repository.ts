import { demoReputation } from "../demo-data.js";

export class ReputationRepository {
  getProfileReputation(profileId: string) {
    return {
      ...demoReputation,
      profileId
    };
  }
}
