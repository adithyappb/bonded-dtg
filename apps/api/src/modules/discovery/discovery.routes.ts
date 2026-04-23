import type { FastifyInstance } from "fastify";
import { routes } from "../../config/routes.js";
import { getBearerToken } from "../../http/auth-context.js";
import type { AuthService } from "../auth/auth.service.js";
import { discoveryQuerySchema, filtersSchema, swipeSchema } from "./discovery.schemas.js";
import { DiscoveryService } from "./discovery.service.js";

export async function registerDiscoveryRoutes(
  app: FastifyInstance,
  deps: { authService: AuthService; discoveryService?: DiscoveryService }
): Promise<void> {
  const discoveryService = deps.discoveryService ?? new DiscoveryService();

  app.get(routes.discovery.feed, async (request) => {
    const auth = await deps.authService.verifySessionToken(getBearerToken(request));
    const query = discoveryQuerySchema.parse(request.query);
    return discoveryService.getFeed(auth.userId, query);
  });

  app.post(routes.discovery.swipe, async (request) => {
    const auth = await deps.authService.verifySessionToken(getBearerToken(request));
    const input = swipeSchema.parse(request.body);
    return discoveryService.swipe(auth.userId, input);
  });

  app.put(routes.discovery.filters, async (request) => {
    const auth = await deps.authService.verifySessionToken(getBearerToken(request));
    const input = filtersSchema.parse(request.body);
    return discoveryService.updateFilters(auth.userId, input);
  });
}
