import type { FastifyInstance } from "fastify";
import { routes } from "../../config/routes.js";
import { getBearerToken } from "../../http/auth-context.js";
import type { AuthService } from "../auth/auth.service.js";
import { blockSchema, reportSchema } from "./moderation.schemas.js";
import { ModerationService } from "./moderation.service.js";

export async function registerModerationRoutes(
  app: FastifyInstance,
  deps: { authService: AuthService; moderationService?: ModerationService }
): Promise<void> {
  const moderationService = deps.moderationService ?? new ModerationService();

  app.post(routes.moderation.report, async (request) => {
    const auth = await deps.authService.verifySessionToken(getBearerToken(request));
    const input = reportSchema.parse(request.body);
    return moderationService.report(auth.userId, input);
  });

  app.post(routes.moderation.block, async (request) => {
    const auth = await deps.authService.verifySessionToken(getBearerToken(request));
    const input = blockSchema.parse(request.body);
    return moderationService.block(auth.userId, input);
  });
}
