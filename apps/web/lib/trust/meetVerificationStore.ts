/**
 * Per-thread mutual “we met” confirmations (demo session store).
 * Production would persist attestations (EAS / contract event).
 */
import { useSyncExternalStore } from "react";

export type MeetThreadState = {
  /** You tapped “We met”. */
  selfConfirmed: boolean;
  /** Counterparty confirmed (simulated or real). */
  peerConfirmed: boolean;
};

/** Stable default so `useSyncExternalStore` getSnapshot does not return a new object each call. */
const EMPTY_MEET_STATE: MeetThreadState = Object.freeze({
  selfConfirmed: false,
  peerConfirmed: false,
});

const _state = new Map<string, MeetThreadState>();
const _listeners = new Set<() => void>();

function _emit() {
  _listeners.forEach((fn) => fn());
}

function _key(threadId: string): string {
  return threadId;
}

export function getMeetState(threadId: string): MeetThreadState {
  return _state.get(_key(threadId)) ?? EMPTY_MEET_STATE;
}

export function subscribeMeetState(onChange: () => void): () => void {
  _listeners.add(onChange);
  return () => _listeners.delete(onChange);
}

export function confirmSelfMet(threadId: string): MeetThreadState {
  const prev = getMeetState(threadId);
  const next = { ...prev, selfConfirmed: true };
  _state.set(_key(threadId), next);
  _emit();
  return next;
}

/** Demo: simulate counterparty confirming after a delay, or call from UI. */
export function confirmPeerMet(threadId: string): MeetThreadState {
  const prev = getMeetState(threadId);
  const next = { ...prev, peerConfirmed: true };
  _state.set(_key(threadId), next);
  _emit();
  return next;
}

export function isMutualMeet(threadId: string): boolean {
  const s = getMeetState(threadId);
  return s.selfConfirmed && s.peerConfirmed;
}

/** Clears all thread state (demo reset / test isolation). */
export function resetMeetVerificationStore(): void {
  _state.clear();
  _emit();
}

export function useMeetVerification(threadId: string): MeetThreadState {
  return useSyncExternalStore(
    subscribeMeetState,
    () => getMeetState(threadId),
    () => getMeetState(threadId),
  );
}
