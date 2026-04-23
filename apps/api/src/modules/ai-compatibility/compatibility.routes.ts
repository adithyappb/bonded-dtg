import type { FastifyInstance } from "fastify";
import { routes } from "../../config/routes.js";
import { compatibilityScoreSchema } from "./compatibility.schemas.js";
import { CompatibilityService } from "./compatibility.service.js";

export async function registerCompatibilityRoutes(
  app: FastifyInstance,
  deps: { compatibilityService?: CompatibilityService } = {}
): Promise<void> {
  const compatibilityService = deps.compatibilityService ?? new CompatibilityService();

  app.post(routes.compatibility.score, async (request) => {
    const input = compatibilityScoreSchema.parse(request.body);
    return compatibilityService.score(input);
  });
}
