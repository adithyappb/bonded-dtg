import type { FastifyInstance } from "fastify";
import { routes } from "../../config/routes.js";
import { getBearerToken } from "../../http/auth-context.js";
import type { AuthService } from "../auth/auth.service.js";
import { boostSchema } from "./spark.schemas.js";
import { SparkService } from "./spark.service.js";

export async function registerSparkRoutes(
  app: FastifyInstance,
  deps: { authService: AuthService; sparkService?: SparkService }
): Promise<void> {
  const sparkService = deps.sparkService ?? new SparkService();

  app.get(routes.spark.balance, async (request) => {
    await deps.authService.verifySessionToken(getBearerToken(request));
    return sparkService.balance();
  });

  app.post(routes.spark.boosts, async (request) => {
    await deps.authService.verifySessionToken(getBearerToken(request));
    const input = boostSchema.parse(request.body);
    return sparkService.buyBoost(input);
  });
}
