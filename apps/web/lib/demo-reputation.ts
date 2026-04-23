/**
 * Demo-only reputation counters (until on-chain / indexer backs this).
 * Ghost score still comes from `ghost-score` store.
 */
export const DEMO_REPUTATION = {
  datesCompleted: 14,
  /** Consecutive staked dates completed without flaking. */
  reliableStreak: 14,
  totalStakedUsdc: 450,
  forfeitedStakes: 1,
  disputesCount: 0,
  /** Distinct mutual “we met” attestations (both parties confirmed). */
  mutualMeetConfirmations: 3,
  /** Successful matchmaker intros (demo baseline; session increments use matchmakerStatsStore). */
  successfulMatchmakerIntros: 0,
  verifiedHuman: true,
} as const;
