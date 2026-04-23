import type { FastifyInstance } from "fastify";
import { routes } from "../../config/routes.js";
import { getBearerToken } from "../../http/auth-context.js";
import type { AuthService } from "../auth/auth.service.js";
import {
  attachNftMintTransactionSchema,
  createNftMintIntentSchema,
  nftMintIntentParamsSchema,
  nftOwnershipParamsSchema
} from "./nft.schemas.js";
import type { NftService } from "./nft.service.js";

export async function registerNftRoutes(
  app: FastifyInstance,
  deps: {
    authService: AuthService;
    nftService: NftService;
  }
): Promise<void> {
  app.get(routes.nft.collections, async () => deps.nftService.listCollections());

  app.post(routes.nft.mintIntents, async (request) => {
    const auth = await deps.authService.verifySessionToken(getBearerToken(request));
    const input = createNftMintIntentSchema.parse(request.body);
    return deps.nftService.createMintIntent(auth, input);
  });

  app.get(routes.nft.mintIntent, async (request) => {
    const auth = await deps.authService.verifySessionToken(getBearerToken(request));
    const params = nftMintIntentParamsSchema.parse(request.params);
    return deps.nftService.getMintIntent(auth, params.intentId);
  });

  app.post(routes.nft.mintTransaction, async (request) => {
    const auth = await deps.authService.verifySessionToken(getBearerToken(request));
    const params = nftMintIntentParamsSchema.parse(request.params);
    const input = attachNftMintTransactionSchema.parse(request.body);
    return deps.nftService.attachMintTransaction(auth, params.intentId, input);
  });

  app.get(routes.nft.ownership, async (request) => {
    const params = nftOwnershipParamsSchema.parse(request.params);
    return deps.nftService.listOwnership(params.profileId);
  });
}
