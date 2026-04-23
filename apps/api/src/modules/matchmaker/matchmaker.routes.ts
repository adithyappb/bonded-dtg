import type { FastifyInstance } from "fastify";
import { routes } from "../../config/routes.js";
import { getBearerToken } from "../../http/auth-context.js";
import type { AuthService } from "../auth/auth.service.js";
import { recommendationSchema } from "./matchmaker.schemas.js";
import { MatchmakerService } from "./matchmaker.service.js";

export async function registerMatchmakerRoutes(
  app: FastifyInstance,
  deps: { authService: AuthService; matchmakerService?: MatchmakerService }
): Promise<void> {
  const matchmakerService = deps.matchmakerService ?? new MatchmakerService();

  app.get(routes.matchmaker.candidates, async (request) => {
    await deps.authService.verifySessionToken(getBearerToken(request));
    return matchmakerService.candidates();
  });

  app.post(routes.matchmaker.recommendations, async (request) => {
    await deps.authService.verifySessionToken(getBearerToken(request));
    const input = recommendationSchema.parse(request.body);
    return matchmakerService.recommend(input);
  });

  app.get(routes.matchmaker.rewards, async (request) => {
    await deps.authService.verifySessionToken(getBearerToken(request));
    return matchmakerService.rewards();
  });
}
