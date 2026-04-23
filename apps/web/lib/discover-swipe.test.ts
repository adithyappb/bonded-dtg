import { describe, expect, it } from "vitest";
import { MATCHED_PROFILES } from "@/lib/matching";
import {
  buildWalletSeededDiscoverDeck,
  deckIndexToMatch,
  incomingLikesProfileIds,
  shouldShowBondedMatch,
} from "@/lib/discover-swipe";

describe("deckIndexToMatch", () => {
  it("cycles through matches", () => {
    const m = [{ id: 1 }, { id: 2 }];
    expect(deckIndexToMatch(0, m)?.id).toBe(1);
    expect(deckIndexToMatch(1, m)?.id).toBe(2);
    expect(deckIndexToMatch(2, m)?.id).toBe(1);
  });

  it("returns undefined for empty deck", () => {
    expect(deckIndexToMatch(0, [])).toBeUndefined();
  });
});

describe("shouldShowBondedMatch", () => {
  it("never matches on pass", () => {
    expect(
      shouldShowBondedMatch({ liked: false, fitScore: 99, profileId: 1, swipeIndex: 0 }),
    ).toBe(false);
  });

  it("always celebrates very high fit", () => {
    expect(
      shouldShowBondedMatch({ liked: true, fitScore: 90, profileId: 1, swipeIndex: 0 }),
    ).toBe(true);
  });

  it("does not celebrate low fit likes", () => {
    expect(
      shouldShowBondedMatch({ liked: true, fitScore: 70, profileId: 1, swipeIndex: 0 }),
    ).toBe(false);
  });

  it("mid-band fit uses deterministic salt (82–89)", () => {
    const params = { liked: true, fitScore: 85, profileId: 7, swipeIndex: 2 } as const;
    const a = shouldShowBondedMatch(params);
    const b = shouldShowBondedMatch(params);
    expect(a).toBe(b);
  });

  it("always celebrates super likes", () => {
    expect(
      shouldShowBondedMatch({
        liked: true,
        fitScore: 40,
        profileId: 9,
        swipeIndex: 2,
        superLike: true,
      }),
    ).toBe(true);
  });
});

describe("wallet-seeded discover deck", () => {
  const addr = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd";

  it("incoming likes are deterministic per address", () => {
    const a = incomingLikesProfileIds(addr);
    const b = incomingLikesProfileIds(addr);
    expect(a).toEqual(b);
    expect(a.length).toBeGreaterThanOrEqual(2);
    expect(a.length).toBeLessThanOrEqual(3);
    a.forEach((id) => {
      expect(id).toBeGreaterThanOrEqual(1);
      expect(id).toBeLessThanOrEqual(8);
    });
  });

  it("different addresses get different incoming sets (usually)", () => {
    const a = incomingLikesProfileIds(addr);
    const c = incomingLikesProfileIds("0x1111111111111111111111111111111111111111");
    expect(a.join()).not.toBe(c.join());
  });

  it("priority profiles appear before others in the deck", () => {
    const deck = buildWalletSeededDiscoverDeck(MATCHED_PROFILES, addr);
    const incoming = new Set(incomingLikesProfileIds(addr));
    const prioritySlice = deck.slice(0, incoming.size);
    const priorityIds = new Set(prioritySlice.map((m) => m.profile.id));
    expect(priorityIds).toEqual(incoming);
    const tailIds = new Set(deck.slice(incoming.size).map((m) => m.profile.id));
    for (const id of incoming) {
      expect(tailIds.has(id)).toBe(false);
    }
  });

  it("buildWalletSeededDiscoverDeck is stable for the same wallet address", () => {
    const deckA = buildWalletSeededDiscoverDeck(MATCHED_PROFILES, addr);
    const deckB = buildWalletSeededDiscoverDeck(MATCHED_PROFILES, addr);
    expect(deckA.map((item) => item.profile.id)).toEqual(
      deckB.map((item) => item.profile.id),
    );
  });

  it("buildWalletSeededDiscoverDeck returns the same fallback deck when no wallet is available", () => {
    const deckA = buildWalletSeededDiscoverDeck(MATCHED_PROFILES, null);
    const deckB = buildWalletSeededDiscoverDeck(MATCHED_PROFILES, null);
    expect(deckA.map((item) => item.profile.id)).toEqual(
      deckB.map((item) => item.profile.id),
    );
    expect(deckA.length).toBeGreaterThan(0);
  });
});
