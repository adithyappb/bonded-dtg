/**
 * StakeEngine interface for the Next.js application layer.
 * Amounts are USDC in product copy; engines store numeric units only.
 */

import type { GhostOutcome } from "@/lib/ghost-score";

export type StakeStatus = "proposed" | "awaiting_peer" | "locked" | "resolved" | "refunded";
export type StakeOutcome = "SUCCESS" | "FLAKED" | "DISPUTED";

export interface StakeParticipant {
  id: string | number;
  displayName: string;
  walletAddress?: string;
  /** Optional: used to compute GhostScoreDelta in demo engines. */
  ghostScore?: number;
}

export interface GhostScoreDelta {
  userId: string;
  outcome: GhostOutcome;
  prevScore: number;
  newScore: number;
}

export interface StakeRecord {
  id: string;
  /** Each party’s contribution (e.g. 15 USDC). */
  amountPerSide: number;
  /** Funds committed per participant index [0, 1]. */
  contributions: [number, number];
  /** Sum of contributions (0, per-side, or full escrow). */
  totalLocked: number;
  participants: [StakeParticipant, StakeParticipant];
  status: StakeStatus;
  outcome: StakeOutcome | null;
  /** Set when a single winner receives the full pot (flake or forfeit). */
  winner: string | number | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface ResolveStakeOptions {
  /** Required when outcome is FLAKED — who no-showed or abandoned the date. */
  flakedParticipantId?: string | number;
}

export interface ResolutionResult {
  stake: StakeRecord;
  payoutNote: string;
  ghostUpdates: GhostScoreDelta[];
}

export interface RefundResult {
  stake: StakeRecord;
  note: string;
}

export interface StakeEngine {
  readonly id: string;
  createStake(amountPerSide: number, participants: [StakeParticipant, StakeParticipant]): Promise<StakeRecord>;
  /** Legacy / instant path: fund both sides in one step (demo + tests). */
  lockStake(stakeId: string): Promise<StakeRecord>;
  /** Fund one side’s contribution (sequential escrow). */
  fundSide(stakeId: string, participantId: string | number): Promise<StakeRecord>;
  /**
   * When only one side funded and the counterparty never posts their stake,
   * the funder claims the full notional pot (2× per-side).
   */
  claimPeerNeverFunded(stakeId: string, claimantId: string | number): Promise<ResolutionResult>;
  resolveStake(stakeId: string, outcome: StakeOutcome, options?: ResolveStakeOptions): Promise<ResolutionResult>;
  refundStake(stakeId: string): Promise<RefundResult>;
  getStakeStatus(stakeId: string): Promise<StakeRecord | null>;
}
