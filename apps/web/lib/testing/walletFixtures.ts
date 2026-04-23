/**
 * Deterministic demo / test wallet identities (not private keys — public addresses only).
 * Use for stake participants, wallet UI labels, and integration tests.
 */
export const WALLET_ALICE = "0x1111111111111111111111111111111111111111" as const;
export const WALLET_BOB = "0x2222222222222222222222222222222222222222" as const;
export const WALLET_CURATOR = "0x3333333333333333333333333333333333333333" as const;
export const WALLET_DEMO_USER = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F" as const;

export const DEMO_WALLET_FIXTURES = {
  alice: WALLET_ALICE,
  bob: WALLET_BOB,
  curator: WALLET_CURATOR,
  primaryDemo: WALLET_DEMO_USER,
} as const;

const HEX_ADDR = /^0x[a-fA-F0-9]{40}$/;

export function assertLooksLikeEthereumAddress(addr: string): asserts addr is `0x${string}` {
  if (!HEX_ADDR.test(addr)) {
    throw new Error(`Invalid demo address: ${addr}`);
  }
}
