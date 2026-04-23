import type { FastifyInstance } from "fastify";
import { routes } from "../../config/routes.js";
import { getBearerToken } from "../../http/auth-context.js";
import type { AuthService } from "../auth/auth.service.js";
import { matchParamsSchema, unmatchSchema } from "./matches.schemas.js";
import { MatchesService } from "./matches.service.js";

export async function registerMatchesRoutes(
  app: FastifyInstance,
  deps: { authService: AuthService; matchesService?: MatchesService }
): Promise<void> {
  const matchesService = deps.matchesService ?? new MatchesService();

  app.get(routes.matches.list, async (request) => {
    await deps.authService.verifySessionToken(getBearerToken(request));
    return matchesService.listMatches();
  });

  app.get(routes.matches.likesYou, async (request) => {
    await deps.authService.verifySessionToken(getBearerToken(request));
    return matchesService.listLikesYou();
  });

  app.post(routes.matches.unmatch, async (request) => {
    const auth = await deps.authService.verifySessionToken(getBearerToken(request));
    const params = matchParamsSchema.parse(request.params);
    const input = unmatchSchema.parse(request.body);
    return matchesService.unmatch(auth.userId, params.matchId, input);
  });
}
