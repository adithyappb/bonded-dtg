/** Default date stake: each party posts this much; full escrow is 2×. */
export const STAKE_PER_SIDE_USDC = 15;

/** When both parties fund, total locked escrow (USDC). */
export const FULL_ESCROW_USDC = STAKE_PER_SIDE_USDC * 2;

export function formatUsdc(amount: number): string {
  const n = Number.isFinite(amount) ? amount : 0;
  const fixed = Number.isInteger(n) ? String(Math.round(n)) : n.toFixed(2);
  return `$${fixed} USDC`;
}
