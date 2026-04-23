/**
 * Singleton stake lifecycle manager for the Next.js app layer.
 * React UI calls stakeManager.* — not CogcoinStakeEngine directly.
 */
import { applyGhostUpdatesForLocalUser } from "@/lib/ghost-score";
import { CogcoinStakeEngine } from "./CogcoinStakeEngine";
import { DEMO_LOCAL_USER_ID } from "./session";
import type {
  RefundResult,
  ResolutionResult,
  ResolveStakeOptions,
  StakeEngine,
  StakeOutcome,
  StakeParticipant,
  StakeRecord,
} from "./types";

let _engine: StakeEngine = new CogcoinStakeEngine();
let _activeStake: StakeRecord | null = null;
const _listeners = new Set<(stake: StakeRecord | null) => void>();

function _emit() {
  _listeners.forEach((fn) => fn(_activeStake));
}

export function setStakeEngine(engine: StakeEngine) {
  _engine = engine;
}

export function subscribeStake(fn: (stake: StakeRecord | null) => void): () => void {
  _listeners.add(fn);
  fn(_activeStake);
  return () => _listeners.delete(fn);
}

/** Create a stake session (both sides still need to fund unless you call lockStake / proposeAndLock). */
export async function beginStake(
  amountPerSide: number,
  participants: [StakeParticipant, StakeParticipant],
): Promise<StakeRecord> {
  const stake = await _engine.createStake(amountPerSide, participants);
  _activeStake = stake;
  _emit();
  return stake;
}

/** Post this participant’s side of the escrow (e.g. $15). */
export async function fundStakeSide(stakeId: string, participantId: string): Promise<StakeRecord> {
  try {
    const updated = await _engine.fundSide(stakeId, participantId);
    if (_activeStake?.id === stakeId) _activeStake = updated;
    _emit();
    return updated;
  } catch (err) {
    console.error(`[StakeManager] fundSide failed for ${stakeId}:`, err);
    throw err;
  }
}

/**
 * Legacy one-step: create + fully fund both sides (instant $30 escrow).
 * Use for quick demos and headless tests.
 */
export async function proposeAndLock(
  amountPerSide: number,
  participants: [StakeParticipant, StakeParticipant],
): Promise<StakeRecord> {
  try {
    const stake = await _engine.createStake(amountPerSide, participants);
    const locked = await _engine.lockStake(stake.id);
    _activeStake = locked;
    _emit();
    return locked;
  } catch (err) {
    console.error("[StakeManager] proposeAndLock failed:", err);
    throw err;
  }
}

/** Counterparty never funded their $15 — you claim the full $30 pot. */
export async function claimPeerNeverFunded(stakeId: string, claimantId: string): Promise<ResolutionResult> {
  try {
    const result = await _engine.claimPeerNeverFunded(stakeId, claimantId);
    applyGhostUpdatesForLocalUser(result.ghostUpdates, claimantId);
    _activeStake = null;
    _emit();
    return result;
  } catch (err) {
    console.error(`[StakeManager] claimPeerNeverFunded failed for ${stakeId}:`, err);
    throw err;
  }
}

export async function resolveStake(
  stakeId: string,
  outcome: StakeOutcome,
  options?: ResolveStakeOptions,
  localUserId: string = DEMO_LOCAL_USER_ID,
): Promise<ResolutionResult> {
  try {
    const result = await _engine.resolveStake(stakeId, outcome, options);
    // Success path: update reputation and clear active session
    applyGhostUpdatesForLocalUser(result.ghostUpdates, localUserId);
    _activeStake = null;
    _emit();
    return result;
  } catch (err) {
    console.error(`[StakeManager] resolveStake failed for ${stakeId}:`, err);
    // Robustness: keep the active stake so the user can retry or check status
    throw err;
  }
}

export async function refundStake(stakeId: string): Promise<RefundResult> {
  const result = await _engine.refundStake(stakeId);
  _activeStake = null;
  _emit();
  return result;
}

export async function getStakeStatus(stakeId: string): Promise<StakeRecord | null> {
  return _engine.getStakeStatus(stakeId);
}

export function getActiveStake(): StakeRecord | null {
  return _activeStake;
}

/** Fresh engine + no active stake — use between demo sessions and integration tests. */
export function resetStakeManagerForTesting(): void {
  _engine = new CogcoinStakeEngine();
  _activeStake = null;
  _emit();
}
