/**
 * Client-side discover deck helpers (demo / UX). Replace with API-backed
 * match state when the backend is wired.
 */
import type { ScoredMatch } from "@/lib/matching-score";

export type SwipeMeta = {
  /** High-signal like from the center action */
  superLike?: boolean;
};

export function deckIndexToMatch<T>(index: number, matches: readonly T[]): T | undefined {
  if (matches.length === 0) return undefined;
  return matches[index % matches.length];
}

/** FNV-1a 32-bit hash of a hex address (stable, fast, no crypto dependency). */
function fnv1a32Hex(address: string): number {
  const hex = address.startsWith("0x") ? address.slice(2).toLowerCase() : address.toLowerCase();
  let hash = 2166136261;
  for (let i = 0; i < hex.length; i++) {
    hash ^= hex.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Demo: deterministic subset of profile ids who “liked you” first, derived from
 * wallet address so the deck feels personal and is reproducible (no Math.random).
 */
export function incomingLikesProfileIds(walletAddress: string | null | undefined): number[] {
  const seed = walletAddress ? fnv1a32Hex(walletAddress) : 0x9e3779b9;
  const count = 2 + (seed % 2);
  const ids = Array.from({ length: 8 }, (_, i) => i + 1);
  const rng = mulberry32(seed);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [ids[i], ids[j]] = [ids[j]!, ids[i]!];
  }
  return ids.slice(0, count).sort((a, b) => a - b);
}

/**
 * Puts wallet-bound “liked you” candidates at the top (by fit score), then shuffles
 * the rest with a seed tied to the address — high-intent discover without server RNG.
 */
export function buildWalletSeededDiscoverDeck(
  rankedMatches: readonly ScoredMatch[],
  walletAddress: string | null | undefined,
): ScoredMatch[] {
  if (rankedMatches.length === 0) return [];
  const incoming = new Set(incomingLikesProfileIds(walletAddress));
  const priority = rankedMatches.filter((m) => incoming.has(m.profile.id)).sort((a, b) => b.score - a.score);
  const rest = rankedMatches.filter((m) => !incoming.has(m.profile.id));
  const seed = walletAddress ? fnv1a32Hex(walletAddress) : 0xdeadbeef;
  const rng = mulberry32(seed ^ 0xbadc0de);
  const shuffled = [...rest];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return [...priority, ...shuffled];
}

/**
 * Deterministic “mutual match” moment for the demo so high-fit likes sometimes
 * pop a celebration without a random number generator.
 */
export function shouldShowBondedMatch(params: {
  liked: boolean;
  fitScore: number;
  profileId: number;
  swipeIndex: number;
  superLike?: boolean;
}): boolean {
  if (!params.liked) return false;
  if (params.superLike) return true;
  if (params.fitScore >= 90) return true;
  if (params.fitScore < 82) return false;
  const salt = params.profileId * 31 + params.swipeIndex * 17;
  return salt % 3 === 0;
}
