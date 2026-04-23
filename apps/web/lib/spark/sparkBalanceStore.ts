/**
 * Demo Spark balance (would be ERC-20 / points ledger in production).
 */
import { useSyncExternalStore } from "react";
import { DEMO_SPARK_BALANCE } from "./constants";

let _balance = DEMO_SPARK_BALANCE;
const _listeners = new Set<() => void>();

function _emit() {
  _listeners.forEach((fn) => fn());
}

export function getSparkBalance(): number {
  return _balance;
}

export function setSparkBalance(n: number): void {
  _balance = n;
  _emit();
}

export function addSpark(delta: number): void {
  if (delta <= 0) return;
  _balance += delta;
  _emit();
}

export function subscribeSparkBalance(onChange: () => void): () => void {
  _listeners.add(onChange);
  return () => _listeners.delete(onChange);
}

export function useSparkBalance(): number {
  return useSyncExternalStore(subscribeSparkBalance, getSparkBalance, getSparkBalance);
}
