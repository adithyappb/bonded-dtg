import { afterEach, describe, expect, it } from "vitest";
import {
  applyGhostOutcome,
  applyGhostUpdatesForLocalUser,
  getGhostScore,
  setGhostScore,
} from "./ghostScoreStore";

describe("ghostScoreStore", () => {
  afterEach(() => {
    setGhostScore(8);
  });

  it("setGhostScore and getGhostScore round-trip", () => {
    setGhostScore(42);
    expect(getGhostScore()).toBe(42);
  });

  it("applyGhostOutcome uses current score as baseline", () => {
    setGhostScore(20);
    const t = applyGhostOutcome("SHOWED_UP");
    expect(t.prevScore).toBe(20);
    expect(getGhostScore()).toBe(t.newScore);
  });

  it("applyGhostUpdatesForLocalUser only updates when userId matches", () => {
    setGhostScore(10);
    applyGhostUpdatesForLocalUser(
      [
        { userId: "other", newScore: 99 },
        { userId: "me", newScore: 15 },
      ],
      "me",
    );
    expect(getGhostScore()).toBe(15);
  });

  it("applyGhostUpdatesForLocalUser no-op when no match", () => {
    setGhostScore(10);
    applyGhostUpdatesForLocalUser([{ userId: "x", newScore: 50 }], "me");
    expect(getGhostScore()).toBe(10);
  });
});
