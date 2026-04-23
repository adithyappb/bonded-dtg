import { ApiError } from "../../http/errors.js";
import type { UpdateProfileRequest } from "./profiles.schemas.js";
import { ProfilesRepository } from "./profiles.repository.js";

export class ProfilesService {
  constructor(private readonly profiles = new ProfilesRepository()) {}

  getCurrentProfile(userId: string) {
    return this.profiles.getCurrentProfile(userId);
  }

  updateCurrentProfile(userId: string, input: UpdateProfileRequest) {
    return this.profiles.updateCurrentProfile(userId, input);
  }

  getPublicProfile(profileId: string) {
    const profile = this.profiles.getProfile(profileId);

    if (!profile) {
      throw new ApiError(404, "profile_not_found", "No public profile exists for that ID.");
    }

    return profile;
  }
}
