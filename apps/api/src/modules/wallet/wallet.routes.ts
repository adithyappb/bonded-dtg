import type { FastifyInstance } from "fastify";
import { routes } from "../../config/routes.js";
import { getBearerToken } from "../../http/auth-context.js";
import type { ChainClient } from "../../integrations/chain-client.js";
import type { AuthService } from "../auth/auth.service.js";
import type { WalletService } from "./wallet.service.js";
import {
  balanceQuerySchema,
  displayPreferencesSchema,
  recordTransactionSchema,
  transactionStatusParamsSchema
} from "./wallet.schemas.js";

export async function registerWalletRoutes(
  app: FastifyInstance,
  deps: {
    authService: AuthService;
    walletService: WalletService;
    chainClient: ChainClient;
  }
): Promise<void> {
  app.get(routes.chain.networks, async () => ({
    networks: deps.chainClient.getSupportedChains()
  }));

  app.get(routes.wallet.me, async (request) => {
    const auth = await deps.authService.verifySessionToken(getBearerToken(request));
    return deps.walletService.getCurrentWalletProfile(auth);
  });

  app.patch(routes.wallet.displayPreferences, async (request) => {
    const auth = await deps.authService.verifySessionToken(getBearerToken(request));
    const input = displayPreferencesSchema.parse(request.body);
    return deps.walletService.updateDisplayPreferences(auth, input);
  });

  app.get(routes.wallet.balance, async (request) => {
    const auth = await deps.authService.verifySessionToken(getBearerToken(request));
    const query = balanceQuerySchema.parse(request.query);
    return deps.walletService.getBalance(auth, query);
  });

  app.post(routes.chain.recordTransaction, async (request) => {
    const auth = await deps.authService.verifySessionToken(getBearerToken(request));
    const input = recordTransactionSchema.parse(request.body);
    return deps.walletService.recordTransaction(auth, input);
  });

  app.get(routes.chain.transactionStatus, async (request) => {
    const params = transactionStatusParamsSchema.parse(request.params);
    return deps.walletService.getTransactionStatus(params.chainId, params.hash);
  });
}
