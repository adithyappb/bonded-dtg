import { describe, expect, it } from "vitest";
import type { AppEnv } from "../../src/config/env.js";
import type { AuthContext } from "../../src/http/auth-context.js";
import { ChainClient } from "../../src/integrations/chain-client.js";
import { EscrowService } from "../../src/modules/escrow/escrow.service.js";

const baseEnv: AppEnv = {
  NODE_ENV: "test",
  HOST: "127.0.0.1",
  PORT: 4000,
  APP_ORIGIN: "http://localhost:3000",
  API_BASE_URL: "http://localhost:4000",
  API_JWT_SECRET: "bonded-project-test-api-jwt-secret",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_PROJECT_ID: "example",
  SUPABASE_ANON_KEY: "anon",
  SUPABASE_SERVICE_ROLE_KEY: "service",
  SUPPORTED_CHAIN_IDS: "84532",
  SUPPORTED_CHAIN_ID_LIST: [84532],
  CHAIN_RPC_URL: "https://sepolia.base.org",
  ESCROW_ADDRESS: undefined,
  ENABLE_DEV_WALLET_AUTH: false
};

const auth: AuthContext = {
  sessionId: "session",
  userId: "user",
  walletId: "wallet",
  address: "0x0000000000000000000000000000000000000001",
  chainId: 84532
};

describe("EVM date stake integration", () => {
  it("reports date staking as not ready until an escrow address is configured", () => {
    const chainClient = new ChainClient(baseEnv);
    const escrowService = new EscrowService({} as never, {} as never, chainClient);

    expect(escrowService.getEscrowConfig()).toEqual({
      networks: [
        {
          chainId: 84532,
          label: "Base Sepolia",
          explorerUrl: "https://sepolia.basescan.org",
          rpcConfigured: true,
          escrowAddress: undefined,
          readyForEscrow: false
        }
      ]
    });
  });

  it("rejects stake intent creation before storage writes when the escrow address is missing", async () => {
    const chainClient = new ChainClient(baseEnv);
    const escrowService = new EscrowService(
      { createIntent: () => Promise.reject(new Error("should not write escrow intent")) } as never,
      { getPrimaryWallet: () => Promise.reject(new Error("should not load wallet")) } as never,
      chainClient
    );

    await expect(
      escrowService.createIntent(auth, {
        dateId: "date-1",
        counterpartyAddress: "0x0000000000000000000000000000000000000002",
        chainId: 84532,
        amountWei: "1000"
      })
    ).rejects.toMatchObject({
      statusCode: 424,
      code: "escrow_address_missing"
    });
  });
});
