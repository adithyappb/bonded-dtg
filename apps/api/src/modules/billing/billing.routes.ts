import type { FastifyInstance } from "fastify";
import { routes } from "../../config/routes.js";
import { getBearerToken } from "../../http/auth-context.js";
import type { AuthService } from "../auth/auth.service.js";
import { checkoutSchema } from "./billing.schemas.js";
import { BillingService } from "./billing.service.js";

export async function registerBillingRoutes(
  app: FastifyInstance,
  deps: { authService: AuthService; billingService?: BillingService }
): Promise<void> {
  const billingService = deps.billingService ?? new BillingService();

  app.get(routes.billing.plans, async () => billingService.plans());

  app.get(routes.billing.status, async (request) => {
    await deps.authService.verifySessionToken(getBearerToken(request));
    return billingService.status();
  });

  app.post(routes.billing.checkout, async (request) => {
    await deps.authService.verifySessionToken(getBearerToken(request));
    const input = checkoutSchema.parse(request.body);
    return billingService.checkout(input);
  });
}
