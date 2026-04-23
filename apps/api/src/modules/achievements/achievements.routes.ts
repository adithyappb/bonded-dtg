import type { FastifyInstance } from "fastify";
import { routes } from "../../config/routes.js";
import { getBearerToken } from "../../http/auth-context.js";
import type { AuthService } from "../auth/auth.service.js";
import { proofRequestSchema } from "./achievements.schemas.js";
import { AchievementsService } from "./achievements.service.js";

export async function registerAchievementsRoutes(
  app: FastifyInstance,
  deps: { authService: AuthService; achievementsService?: AchievementsService }
): Promise<void> {
  const achievementsService = deps.achievementsService ?? new AchievementsService();

  app.get(routes.achievements.catalog, async () => achievementsService.catalog());

  app.get(routes.achievements.mine, async (request) => {
    await deps.authService.verifySessionToken(getBearerToken(request));
    return achievementsService.mine();
  });

  app.post(`${routes.achievements.mine}/proofs`, async (request) => {
    await deps.authService.verifySessionToken(getBearerToken(request));
    const input = proofRequestSchema.parse(request.body);
    return achievementsService.requestProof(input);
  });
}
