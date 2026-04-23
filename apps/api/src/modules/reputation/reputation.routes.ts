import type { FastifyInstance } from "fastify";
import { routes } from "../../config/routes.js";
import { reputationParamsSchema } from "./reputation.schemas.js";
import { ReputationService } from "./reputation.service.js";

export async function registerReputationRoutes(
  app: FastifyInstance,
  deps: { reputationService?: ReputationService } = {}
): Promise<void> {
  const reputationService = deps.reputationService ?? new ReputationService();

  app.get(routes.reputation.profile, async (request) => {
    const params = reputationParamsSchema.parse(request.params);
    return reputationService.getProfileReputation(params.profileId);
  });
}
