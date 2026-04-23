import { DAILY_SWIPE_CAP } from "./constants";

/** Whether the daily swipe quota is exhausted (pure; pairs with persisted count). */
export function isDailySwipeLocked(swipesUsed: number, cap: number = DAILY_SWIPE_CAP): boolean {
  return swipesUsed >= cap;
}
