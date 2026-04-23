import { pathToFileURL } from "node:url";
import cors from "@fastify/cors";
import Fastify from "fastify";
import { getEnv } from "./config/env.js";
import { routes } from "./config/routes.js";
import { createSupabaseAdminClient } from "./db/supabase-client.js";
import { installErrorHandler } from "./http/errors.js";
import { ChainClient } from "./integrations/chain-client.js";
import { AuthService } from "./modules/auth/auth.service.js";
import { registerAuthRoutes } from "./modules/auth/auth.routes.js";
import { registerWalletRoutes } from "./modules/wallet/wallet.routes.js";
import { WalletRepository } from "./modules/wallet/wallet.repository.js";
import { WalletService } from "./modules/wallet/wallet.service.js";
import { EscrowRepository } from "./modules/escrow/escrow.repository.js";
import { EscrowService } from "./modules/escrow/escrow.service.js";
import { registerEscrowRoutes } from "./modules/escrow/escrow.routes.js";
import { registerAchievementsRoutes } from "./modules/achievements/achievements.routes.js";
import { registerBillingRoutes } from "./modules/billing/billing.routes.js";
import { registerCompatibilityRoutes } from "./modules/ai-compatibility/compatibility.routes.js";
import { CryptoRepository } from "./modules/crypto/crypto.repository.js";
import { registerCryptoRoutes } from "./modules/crypto/crypto.routes.js";
import { CryptoService } from "./modules/crypto/crypto.service.js";
import { registerDatesRoutes } from "./modules/dates/dates.routes.js";
import { registerDiscoveryRoutes } from "./modules/discovery/discovery.routes.js";
import { registerMatchesRoutes } from "./modules/matches/matches.routes.js";
import { registerMatchmakerRoutes } from "./modules/matchmaker/matchmaker.routes.js";
import { registerMessagesRoutes } from "./modules/messages/messages.routes.js";
import { registerModerationRoutes } from "./modules/moderation/moderation.routes.js";
import { registerNotificationsRoutes } from "./modules/notifications/notifications.routes.js";
import { NftRepository } from "./modules/nft/nft.repository.js";
import { registerNftRoutes } from "./modules/nft/nft.routes.js";
import { NftService } from "./modules/nft/nft.service.js";
import { registerProfilesRoutes } from "./modules/profiles/profiles.routes.js";
import { registerReputationRoutes } from "./modules/reputation/reputation.routes.js";
import { registerSparkRoutes } from "./modules/spark/spark.routes.js";

export async function buildServer() {
  const env = getEnv();
  const app = Fastify({
    logger: env.NODE_ENV !== "test"
  });

  installErrorHandler(app);

  await app.register(cors, {
    origin: env.APP_ORIGIN,
    credentials: true
  });

  const supabase = createSupabaseAdminClient(env);
  const chainClient = new ChainClient(env);
  const walletRepository = new WalletRepository(supabase);
  const authService = new AuthService(env, supabase, chainClient);
  const walletService = new WalletService(walletRepository, chainClient);
  const escrowRepository = new EscrowRepository(supabase);
  const escrowService = new EscrowService(escrowRepository, walletRepository, chainClient);
  const cryptoRepository = new CryptoRepository(supabase);
  const cryptoService = new CryptoService(cryptoRepository, walletRepository, chainClient);
  const nftRepository = new NftRepository(supabase);
  const nftService = new NftService(nftRepository, walletRepository, chainClient);

  app.get(routes.health, async () => ({
    ok: true,
    service: "bonded-project-api",
    evmWalletBackend: true
  }));

  await registerAuthRoutes(app, authService);
  await registerWalletRoutes(app, {
    authService,
    walletService,
    chainClient
  });
  await registerEscrowRoutes(app, {
    authService,
    escrowService
  });
  await registerCryptoRoutes(app, {
    authService,
    cryptoService
  });
  await registerNftRoutes(app, {
    authService,
    nftService
  });
  await registerProfilesRoutes(app, { authService });
  await registerDiscoveryRoutes(app, { authService });
  await registerMatchesRoutes(app, { authService });
  await registerMessagesRoutes(app, { authService });
  await registerDatesRoutes(app, { authService });
  await registerMatchmakerRoutes(app, { authService });
  await registerReputationRoutes(app);
  await registerAchievementsRoutes(app, { authService });
  await registerSparkRoutes(app, { authService });
  await registerBillingRoutes(app, { authService });
  await registerCompatibilityRoutes(app);
  await registerNotificationsRoutes(app, { authService });
  await registerModerationRoutes(app, { authService });

  return app;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const env = getEnv();
  const app = await buildServer();

  await app.listen({
    host: env.HOST,
    port: env.PORT
  });
}
