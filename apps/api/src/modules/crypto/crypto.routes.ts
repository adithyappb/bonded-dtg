import type { FastifyInstance } from "fastify";
import { routes } from "../../config/routes.js";
import { getBearerToken } from "../../http/auth-context.js";
import type { AuthService } from "../auth/auth.service.js";
import {
  attachPaymentTransactionSchema,
  createPaymentIntentSchema,
  paymentIntentParamsSchema
} from "./crypto.schemas.js";
import type { CryptoService } from "./crypto.service.js";

export async function registerCryptoRoutes(
  app: FastifyInstance,
  deps: {
    authService: AuthService;
    cryptoService: CryptoService;
  }
): Promise<void> {
  app.get(routes.crypto.config, async () => deps.cryptoService.getConfig());

  app.post(routes.crypto.paymentIntents, async (request) => {
    const auth = await deps.authService.verifySessionToken(getBearerToken(request));
    const input = createPaymentIntentSchema.parse(request.body);
    return deps.cryptoService.createPaymentIntent(auth, input);
  });

  app.get(routes.crypto.paymentIntent, async (request) => {
    const auth = await deps.authService.verifySessionToken(getBearerToken(request));
    const params = paymentIntentParamsSchema.parse(request.params);
    return deps.cryptoService.getPaymentIntent(auth, params.intentId);
  });

  app.post(routes.crypto.paymentTransaction, async (request) => {
    const auth = await deps.authService.verifySessionToken(getBearerToken(request));
    const params = paymentIntentParamsSchema.parse(request.params);
    const input = attachPaymentTransactionSchema.parse(request.body);
    return deps.cryptoService.attachTransaction(auth, params.intentId, input);
  });
}
