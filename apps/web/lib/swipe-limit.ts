"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { DAILY_SWIPE_CAP } from "./constants";

const COUNT_KEY = "bonded:swipe-count";
const LOCK_KEY = "bonded:swipe-locked-at";
const LOCK_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", emit);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", emit);
  };
}

interface SwipeState {
  count: number;
  lockedAt: number | null;
  isLocked: boolean;
}

const INITIAL_STATE: SwipeState = { count: 0, lockedAt: null, isLocked: false };
let lastState: SwipeState = INITIAL_STATE;

function getSwipeState(): SwipeState {
  if (typeof window === "undefined") {
    return INITIAL_STATE;
  }

  try {
    const countStr = localStorage.getItem(COUNT_KEY);
    const lockedAtStr = localStorage.getItem(LOCK_KEY);
    
    let count = countStr ? parseInt(countStr, 10) : 0;
    let lockedAt = lockedAtStr ? parseInt(lockedAtStr, 10) : null;

    if (lockedAt) {
      const elapsed = Date.now() - lockedAt;
      if (elapsed >= LOCK_DURATION_MS) {
        // Reset if 24 hours passed
        count = 0;
        lockedAt = null;
        localStorage.removeItem(COUNT_KEY);
        localStorage.removeItem(LOCK_KEY);
        emit();
      }
    }

    // Only return a new object if the values actually changed
    if (
      count !== lastState.count ||
      lockedAt !== lastState.lockedAt
    ) {
      lastState = {
        count,
        lockedAt,
        isLocked: count >= DAILY_SWIPE_CAP,
      };
    }

    return lastState;
  } catch {
    return INITIAL_STATE;
  }
}

export function useSwipeLimit() {
  const hydrated = useHydrated();
  const state = useSyncExternalStore(
    subscribe,
    () => (hydrated ? getSwipeState() : INITIAL_STATE),
    () => INITIAL_STATE,
  );

  const recordSwipe = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      const currentState = getSwipeState();
      if (currentState.isLocked) return;

      const newCount = currentState.count + 1;
      localStorage.setItem(COUNT_KEY, newCount.toString());

      if (newCount >= DAILY_SWIPE_CAP) {
        const now = Date.now();
        localStorage.setItem(LOCK_KEY, now.toString());
      }
      
      emit();
    } catch (e) {
      console.error("Failed to record swipe", e);
    }
  }, []);

  return {
    swipesUsed: state.count,
    isLocked: state.isLocked,
    recordSwipe,
  };
}
