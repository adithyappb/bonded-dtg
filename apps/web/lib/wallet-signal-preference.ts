"use client";

import { useSyncExternalStore } from "react";
import { useHydrated } from "@/lib/hooks/useHydrated";

const STORAGE_KEY = "bonded:wallet-signal-sharing";

const listeners = new Set<() => void>();

function read(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function emit() {
  listeners.forEach((l) => l());
}

export function setWalletSignalSharing(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (enabled) localStorage.setItem(STORAGE_KEY, "1");
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* quota / private mode */
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Whether the user opted in to sharing a wallet balance signal with matches. */
export function useWalletSignalSharing(): boolean {
  const hydrated = useHydrated();
  return useSyncExternalStore(subscribe, () => (hydrated ? read() : false), () => false);
}
