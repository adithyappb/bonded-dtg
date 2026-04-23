export type AchievementTone = "celebrate" | "milestone" | "caution";

export interface AchievementDefinition {
  id: string;
  title: string;
  shortDesc: string;
  emoji: string;
  tone: AchievementTone;
  /** Shown under caution-tier badges; always constructive. */
  nudge: string;
  /** Human-readable unlock rule for locked-state hints. */
  requirement: string;
}

export interface AchievementUnlock {
  definition: AchievementDefinition;
  unlocked: boolean;
  /** 0–1 progress when not yet unlocked (optional). */
  progress?: number;
}
