import type { FastifyInstance } from "fastify";
import { routes } from "../../config/routes.js";
import { getBearerToken } from "../../http/auth-context.js";
import type { AuthService } from "../auth/auth.service.js";
import {
  attachEscrowTransactionSchema,
  createEscrowIntentSchema,
  escrowIntentParamsSchema
} from "./escrow.schemas.js";
import type { EscrowService } from "./escrow.service.js";

export async function registerEscrowRoutes(
  app: FastifyInstance,
  deps: {
    authService: AuthService;
    escrowService: EscrowService;
  }
): Promise<void> {
  app.get(routes.staking.config, async () => deps.escrowService.getEscrowConfig());

  app.post(routes.staking.intents, async (request) => {
    const auth = await deps.authService.verifySessionToken(getBearerToken(request));
    const input = createEscrowIntentSchema.parse(request.body);
    return deps.escrowService.createIntent(auth, input);
  });

  app.post(routes.staking.intentTransaction, async (request) => {
    const auth = await deps.authService.verifySessionToken(getBearerToken(request));
    const params = escrowIntentParamsSchema.parse(request.params);
    const input = attachEscrowTransactionSchema.parse(request.body);
    return deps.escrowService.attachTransaction(auth, params.intentId, input);
  });

  app.get(routes.staking.intentStatus, async (request) => {
    const auth = await deps.authService.verifySessionToken(getBearerToken(request));
    const params = escrowIntentParamsSchema.parse(request.params);
    return deps.escrowService.getIntentStatus(auth, params.intentId);
  });
}
