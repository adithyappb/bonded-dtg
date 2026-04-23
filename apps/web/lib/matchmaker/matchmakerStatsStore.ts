/**
 * Demo session state: successful intros and deduped pair keys.
 * Production would index on-chain attestations + indexer.
 */
import { useSyncExternalStore } from "react";

let _successfulIntros = 0;
const _introducedPairKeys = new Set<string>();
const _listeners = new Set<() => void>();

function _emit() {
  _listeners.forEach((fn) => fn());
}

export function getSuccessfulMatchmakerIntros(): number {
  return _successfulIntros;
}

export function hasIntroducedPair(pairKey: string): boolean {
  return _introducedPairKeys.has(pairKey);
}

/**
 * Records a successful intro if this pair was not already credited.
 * @returns true if this was a new credit (Spark + achievement should apply).
 */
export function tryRecordSuccessfulIntro(pairKey: string): boolean {
  if (_introducedPairKeys.has(pairKey)) return false;
  _introducedPairKeys.add(pairKey);
  _successfulIntros += 1;
  _emit();
  return true;
}

export function subscribeMatchmakerStats(onChange: () => void): () => void {
  _listeners.add(onChange);
  return () => _listeners.delete(onChange);
}

export function useSuccessfulMatchmakerIntros(): number {
  return useSyncExternalStore(subscribeMatchmakerStats, getSuccessfulMatchmakerIntros, getSuccessfulMatchmakerIntros);
}

/** Clears intro credits (demo reset / test isolation). */
export function resetMatchmakerStats(): void {
  _successfulIntros = 0;
  _introducedPairKeys.clear();
  _emit();
}
