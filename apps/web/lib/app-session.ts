"use client";

import { useRouter } from "next/navigation";
import { useCallback, useSyncExternalStore } from "react";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { routes } from "@/lib/routes";
import { useWallet } from "@/lib/wallet";

const STORAGE_KEY = "bonded:app-session";

const listeners = new Set<() => void>();

function readEntered(): boolean {
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

/** Mark that the user chose “Existing user, enter app” (guest shell until wallet connects). */
export function enterAppSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* quota / private mode */
  }
  emit();
}

export function exitAppSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* */
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

export function useAppSessionEntered(): boolean {
  const hydrated = useHydrated();
  return useSyncExternalStore(subscribe, () => (hydrated ? readEntered() : false), () => false);
}

/** Wallet disconnect + clear guest session + land on home (used for every “sign out” path). */
export function useAppSignOut() {
  const router = useRouter();
  const { disconnect } = useWallet();

  return useCallback(async () => {
    await disconnect();
    exitAppSession();
    router.push(routes.home);
  }, [disconnect, router]);
}
