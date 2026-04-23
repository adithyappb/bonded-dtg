import { describe, expect, it } from "vitest";
import { DAILY_SWIPE_CAP } from "./constants";
import { isDailySwipeLocked } from "./swipe-limit.logic";

describe("isDailySwipeLocked", () => {
  it("locks exactly at cap", () => {
    expect(isDailySwipeLocked(DAILY_SWIPE_CAP - 1)).toBe(false);
    expect(isDailySwipeLocked(DAILY_SWIPE_CAP)).toBe(true);
    expect(isDailySwipeLocked(DAILY_SWIPE_CAP + 3)).toBe(true);
  });

  it("respects custom cap", () => {
    expect(isDailySwipeLocked(2, 3)).toBe(false);
    expect(isDailySwipeLocked(3, 3)).toBe(true);
  });
});
