import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("API health", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-key");
    vi.stubEnv("API_JWT_SECRET", "bonded-project-test-api-jwt-secret");
    vi.stubEnv("SUPPORTED_CHAIN_IDS", "84532");
    vi.stubEnv("CHAIN_RPC_URL", "https://sepolia.base.org");
    vi.stubEnv("ESCROW_ADDRESS", "");
    vi.stubEnv("ENABLE_DEV_WALLET_AUTH", "false");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("boots the EVM wallet backend and serves unauthenticated health", async () => {
    const { buildServer } = await import("../../src/main.js");
    const app = await buildServer();

    try {
      const response = await app.inject({
        method: "GET",
        url: "/health"
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        ok: true,
        service: "bonded-project-api",
        evmWalletBackend: true
      });
    } finally {
      await app.close();
    }
  });

  it("keeps wallet-address shortcut login disabled unless explicitly enabled", async () => {
    const { buildServer } = await import("../../src/main.js");
    const app = await buildServer();

    try {
      const response = await app.inject({
        method: "POST",
        url: "/v1/auth/wallet/dev-login",
        payload: {
          address: "0x0000000000000000000000000000000000000001",
          chainId: 84532
        }
      });

      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchObject({
        error: {
          code: "dev_wallet_auth_disabled"
        }
      });
    } finally {
      await app.close();
    }
  });
});
