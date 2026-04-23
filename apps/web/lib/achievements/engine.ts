import type { AchievementDefinition, AchievementUnlock } from "./types";
import { ACHIEVEMENT_CATALOG } from "./definitions";

export interface AchievementSignals {
  datesCompleted: number;
  reliableStreak: number;
  totalStakedUsdc: number;
  forfeitedStakes: number;
  ghostScore: number;
  mutualMeetConfirmations: number;
  disputesCount: number;
  /** Successful mutual-preference intros credited to you as matchmaker. */
  successfulMatchmakerIntros: number;
  /** 0–100 composite trust (see `lib/trust`). */
  trustScore: number;
}

function def(id: string): AchievementDefinition {
  const d = ACHIEVEMENT_CATALOG.find((x) => x.id === id);
  if (!d) {
    console.warn(`[Achievements] Unknown id: ${id}. Falling back to placeholder.`);
    return {
      id,
      title: "Unknown Milestone",
      shortDesc: "Definition is syncing.",
      emoji: "❓",
      tone: "milestone",
      nudge: "Stay active to see this unlock.",
      requirement: "Syncing data",
    };
  }
  return d;
}

function unlockRow(
  definition: AchievementDefinition,
  unlocked: boolean,
  progress = 0
): AchievementUnlock {
  return { definition, unlocked, progress: Math.min(1, Math.max(0, progress)) };
}

/**
 * Evaluates which NFTs are minted for current signals. Caution-tier badges only
 * appear when their condition is true — paired with forward-looking nudge copy.
 */
export function evaluateAchievements(s: AchievementSignals): {
  unlocked: AchievementUnlock[];
  upcoming: AchievementUnlock[];
} {
  const unlocked: AchievementUnlock[] = [];
  const upcoming: AchievementUnlock[] = [];

  const checks: { id: string; ok: boolean; progress?: number }[] = [
    { id: "first_staked_date", ok: s.datesCompleted >= 1, progress: Math.min(1, s.datesCompleted) },
    {
      id: "reliable_chain_5",
      ok: s.reliableStreak >= 5,
      progress: Math.min(1, s.reliableStreak / 5),
    },
    {
      id: "reliable_chain_10",
      ok: s.reliableStreak >= 10,
      progress: Math.min(1, s.reliableStreak / 10),
    },
    {
      id: "mutual_meet_bond",
      ok: s.mutualMeetConfirmations >= 1,
      progress: s.mutualMeetConfirmations > 0 ? 1 : 0,
    },
    {
      id: "stake_volume_diamond",
      ok: s.totalStakedUsdc >= 1000,
      progress: Math.min(1, s.totalStakedUsdc / 1000),
    },
    { id: "trust_anchor", ok: s.trustScore >= 80, progress: Math.min(1, s.trustScore / 80) },
    {
      id: "matchmaker_cupid",
      ok: s.successfulMatchmakerIntros >= 1,
      progress: Math.min(1, s.successfulMatchmakerIntros),
    },
    { id: "caution_reliability_dip", ok: s.ghostScore >= 40 },
    { id: "caution_forfeit", ok: s.forfeitedStakes >= 1 },
    { id: "caution_dispute", ok: s.disputesCount >= 1 },
  ];

  for (const c of checks) {
    const d = def(c.id);
    if (c.ok) {
      unlocked.push(unlockRow(d, true));
    } else if (d.tone !== "caution") {
      upcoming.push(unlockRow(d, false, c.progress ?? 0));
    }
  }

  const celebrateFirst = (a: AchievementUnlock, b: AchievementUnlock) => {
    const order = { celebrate: 0, milestone: 1, caution: 2 };
    return order[a.definition.tone] - order[b.definition.tone];
  };

  unlocked.sort(celebrateFirst);
  upcoming.sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0));

  return { unlocked, upcoming };
}
