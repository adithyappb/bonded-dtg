import { demoProfiles } from "../demo-data.js";
import type { UpdateProfileRequest } from "./profiles.schemas.js";

export class ProfilesRepository {
  private readonly profiles = new Map(demoProfiles.map((profile) => [profile.id, profile]));

  getProfile(profileId: string) {
    return this.profiles.get(profileId) ?? null;
  }

  getCurrentProfile(userId: string) {
    return {
      id: userId,
      name: "You",
      age: 30,
      city: "Demo City",
      bio: "Looking for intentional plans and clear follow-through.",
      interests: ["coffee", "walks", "live music"],
      walletValueVisible: false
    };
  }

  updateCurrentProfile(userId: string, input: UpdateProfileRequest) {
    return {
      id: userId,
      ...input
    };
  }
}
