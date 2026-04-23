import type { FastifyInstance } from "fastify";
import { routes } from "../../config/routes.js";
import { getBearerToken } from "../../http/auth-context.js";
import type { AuthService } from "../auth/auth.service.js";
import { dateOutcomeSchema, dateParamsSchema, proposeDateSchema } from "./dates.schemas.js";
import { DatesService } from "./dates.service.js";

export async function registerDatesRoutes(
  app: FastifyInstance,
  deps: { authService: AuthService; datesService?: DatesService }
): Promise<void> {
  const datesService = deps.datesService ?? new DatesService();

  app.get(routes.dates.list, async (request) => {
    await deps.authService.verifySessionToken(getBearerToken(request));
    return datesService.listDates();
  });

  app.get(routes.dates.detail, async (request) => {
    await deps.authService.verifySessionToken(getBearerToken(request));
    const params = dateParamsSchema.parse(request.params);
    return datesService.getDate(params.dateId);
  });

  app.post(routes.dates.propose, async (request) => {
    await deps.authService.verifySessionToken(getBearerToken(request));
    const input = proposeDateSchema.parse(request.body);
    return datesService.proposeDate(input);
  });

  app.post(routes.dates.outcome, async (request) => {
    await deps.authService.verifySessionToken(getBearerToken(request));
    const params = dateParamsSchema.parse(request.params);
    const input = dateOutcomeSchema.parse(request.body);
    return datesService.recordOutcome(params.dateId, input);
  });
}
