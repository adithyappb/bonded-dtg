import type { FastifyRequest } from "fastify";
import type { EvmAddress } from "../integrations/chain-client.js";
import { ApiError } from "./errors.js";

export type AuthContext = {
  sessionId: string;
  userId: string;
  walletId: string;
  address: EvmAddress;
  chainId: number;
};

export function getBearerToken(request: FastifyRequest): string {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    throw new ApiError(401, "missing_bearer_token", "Expected an Authorization header with a bearer token.");
  }

  return authorization.slice("Bearer ".length).trim();
}
