import type { FastifyInstance } from "fastify";
import { routes } from "../../config/routes.js";
import { getBearerToken } from "../../http/auth-context.js";
import type { AuthService } from "../auth/auth.service.js";
import { profileParamsSchema, updateProfileSchema } from "./profiles.schemas.js";
import { ProfilesService } from "./profiles.service.js";

export async function registerProfilesRoutes(
  app: FastifyInstance,
  deps: { authService: AuthService; profilesService?: ProfilesService }
): Promise<void> {
  const profilesService = deps.profilesService ?? new ProfilesService();

  app.get(routes.profiles.me, async (request) => {
    const auth = await deps.authService.verifySessionToken(getBearerToken(request));
    return profilesService.getCurrentProfile(auth.userId);
  });

  app.put(routes.profiles.me, async (request) => {
    const auth = await deps.authService.verifySessionToken(getBearerToken(request));
    const input = updateProfileSchema.parse(request.body);
    return profilesService.updateCurrentProfile(auth.userId, input);
  });

  app.get(routes.profiles.public, async (request) => {
    const params = profileParamsSchema.parse(request.params);
    return profilesService.getPublicProfile(params.profileId);
  });
}
