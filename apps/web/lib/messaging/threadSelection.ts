/**
 * Pure helpers for URL-driven thread selection (demo messages UI).
 */

export function parseThreadQueryParam(threadParam: string | null): number | null {
  if (threadParam == null || threadParam === "") return null;
  const n = Number.parseInt(threadParam, 10);
  return Number.isFinite(n) ? n : null;
}

export function resolveInitialThreadId(
  threadParam: string | null,
  conversations: readonly { id: number }[],
): number | null {
  if (conversations.length === 0) return null;
  const n = parseThreadQueryParam(threadParam);
  if (n !== null && conversations.some((c) => c.id === n)) {
    return n;
  }
  return conversations[0]!.id;
}

export function isKnownThreadId(id: number, conversations: readonly { id: number }[]): boolean {
  return conversations.some((c) => c.id === id);
}
