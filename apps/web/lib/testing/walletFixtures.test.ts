import { describe, expect, it } from "vitest";
import { assertLooksLikeEthereumAddress, DEMO_WALLET_FIXTURES, WALLET_ALICE } from "./walletFixtures";

describe("walletFixtures", () => {
  it("demo addresses are 0x + 40 hex", () => {
    for (const v of Object.values(DEMO_WALLET_FIXTURES)) {
      expect(v).toMatch(/^0x[a-fA-F0-9]{40}$/);
      assertLooksLikeEthereumAddress(v);
    }
  });

  it("assertLooksLikeEthereumAddress throws on bad input", () => {
    expect(() => assertLooksLikeEthereumAddress("not-an-address")).toThrow();
    expect(() => assertLooksLikeEthereumAddress(WALLET_ALICE)).not.toThrow();
  });
});
