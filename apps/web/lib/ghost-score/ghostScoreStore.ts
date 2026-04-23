/**
 * In-memory Ghost Score for the active demo session (syncs dashboard / profile badges).
 * Contract code would persist this; here we only need reactive UI.
 */
import { useSyncExternalStore } from "react";
import { nextGhostScore, type GhostScoreTransition } from "./ghostScore";
import type { GhostOutcome } from "./types";

let _score = 8;
const _listeners = new Set<() => void>();

function _emit() {
  _listeners.forEach((fn) => fn());
}

export function getGhostScore(): number {
  return _score;
}

export function setGhostScore(score: number): void {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  if (_score !== clamped) {
    console.log(`[GhostScore] Base update: ${_score} -> ${clamped}`);
    _score = clamped;
    _emit();
  }
}

export function subscribeGhostScore(onChange: () => void): () => void {
  _listeners.add(onChange);
  return () => _listeners.delete(onChange);
}

/** Apply an outcome for reputation; returns transition if score changed. */
export function applyGhostOutcome(outcome: GhostOutcome): GhostScoreTransition {
  const t = nextGhostScore(_score, outcome);
  const clamped = Math.max(0, Math.min(100, t.newScore));
  
  if (_score !== clamped) {
    console.log(`[GhostScore] Transition: ${t.outcome} (${_score} -> ${clamped})`);
    _score = clamped;
    _emit();
  }
  
  return { ...t, newScore: clamped };
}

/** Apply engine-computed deltas for the signed-in user (demo: one local profile). */
export function applyGhostUpdatesForLocalUser(
  updates: ReadonlyArray<{ userId: string; newScore: number }>,
  localUserId: string,
): void {
  const mine = updates.find((u) => u.userId === localUserId);
  if (!mine) return;
  
  const clamped = Math.max(0, Math.min(100, Math.round(mine.newScore)));
  if (_score !== clamped) {
    console.log(`[GhostScore] Sync: ${_score} -> ${clamped} (User: ${localUserId})`);
    _score = clamped;
    _emit();
  }
}

export function useGhostScore(): number {
  return useSyncExternalStore(subscribeGhostScore, getGhostScore, getGhostScore);
}
