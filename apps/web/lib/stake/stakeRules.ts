import { formatUsdc } from "./constants";
import type { StakeOutcome } from "./types";

export function expectedFullEscrow(amountPerSide: number): number {
  return amountPerSide * 2;
}

export function payoutSummary(
  outcome: StakeOutcome,
  amountPerSide: number,
  totalEscrow: number,
  opts?: { winnerLabel?: string; flakedLabel?: string },
): string {
  const full = expectedFullEscrow(amountPerSide);
  switch (outcome) {
    case "SUCCESS":
      return `Great date — each of you gets ${formatUsdc(amountPerSide)} back (${formatUsdc(totalEscrow)} released).`;
    case "FLAKED": {
      const who = opts?.flakedLabel ?? "your match";
      const winner = opts?.winnerLabel ?? "You";
      return `${winner} receives ${formatUsdc(full)} (full escrow). ${who} took the Ghost hit for flaking.`;
    }
    case "DISPUTED":
      return `Dispute resolved — each side receives about 75% of ${formatUsdc(amountPerSide)}; both take a small Ghost penalty.`;
    default:
      return "Stake resolved.";
  }
}

export function peerNeverFundedSummary(amountPerSide: number, totalPayout: number, counterpartyLabel: string): string {
  return `They never funded their ${formatUsdc(amountPerSide)} — you receive ${formatUsdc(totalPayout)} (their slot forfeited). ${counterpartyLabel}'s Ghost Score reflects backing out.`;
}
