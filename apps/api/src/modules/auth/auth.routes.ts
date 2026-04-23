import type { FastifyInstance } from "fastify";
import { routes } from "../../config/routes.js";
import { getBearerToken } from "../../http/auth-context.js";
import type { AuthService } from "./auth.service.js";
import { devWalletLoginRequestSchema, walletChallengeRequestSchema, walletVerifyRequestSchema } from "./auth.schemas.js";

export async function registerAuthRoutes(app: FastifyInstance, authService: AuthService): Promise<void> {
  app.post(routes.auth.challenge, async (request) => {
    const input = walletChallengeRequestSchema.parse(request.body);
    return authService.createWalletChallenge(input);
  });

  app.post(routes.auth.verify, async (request) => {
    const input = walletVerifyRequestSchema.parse(request.body);
    return authService.verifyWalletChallenge(input);
  });

  app.post(routes.auth.devLogin, async (request) => {
    const input = devWalletLoginRequestSchema.parse(request.body);
    return authService.devLoginWithWalletAddress(input);
  });

  app.get(routes.auth.session, async (request) => {
    const token = getBearerToken(request);
    return authService.verifySessionToken(token);
  });

  app.post(routes.auth.logout, async (request, reply) => {
    const token = getBearerToken(request);
    await authService.logout(token);
    return reply.status(204).send();
  });
}
