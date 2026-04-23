"use client";

import { motion } from "framer-motion";
import { Check, Lock, Sparkles, Sprout } from "lucide-react";
import { useAchievementEvaluation } from "@/lib/hooks/useAchievements";
import { cn } from "@/lib/cn";

export function AchievementGrid() {
  const { unlocked, upcoming } = useAchievementEvaluation();

  const celebrate = unlocked.filter((u) => u.definition.tone !== "caution");
  const growth = unlocked.filter((u) => u.definition.tone === "caution");

  return (
    <div className="space-y-6">
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" aria-hidden />
          <h3 className="font-heading text-sm font-semibold text-foreground">Progress & milestones</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {celebrate.length === 0 ? (
            <p className="text-xs text-muted-foreground sm:col-span-2">
              Complete a staked date or raise your trust score to mint your first celebration NFT.
            </p>
          ) : null}
          {celebrate.map(({ definition }) => (
            <motion.div
              key={definition.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "rounded-xl border p-4 transition-colors",
                definition.tone === "celebrate" && "border-primary/35 bg-primary/5",
                definition.tone === "milestone" && "border-accent/30 bg-accent/5",
              )}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden>
                  {definition.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-heading text-sm font-semibold text-foreground">{definition.title}</p>
                    <Check className="h-3.5 w-3.5 shrink-0 text-primary" aria-label="Unlocked" />
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{definition.shortDesc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {growth.length > 0 ? (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Sprout className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden />
            <h3 className="font-heading text-sm font-semibold text-foreground">Growth NFTs (honest signals)</h3>
          </div>
          <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
            These attestations mark a rough patch — they exist so you can prove improvement over time. Every badge includes a
            forward path.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {growth.map(({ definition }) => (
              <motion.div
                key={definition.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl" aria-hidden>
                    {definition.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-sm font-semibold text-foreground">{definition.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{definition.shortDesc}</p>
                    <p className="mt-2 rounded-lg bg-background/60 px-2.5 py-2 text-xs leading-relaxed text-foreground/90">
                      <span className="font-medium text-amber-700 dark:text-amber-300">Next step: </span>
                      {definition.nudge}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" aria-hidden />
          <h3 className="font-heading text-sm font-semibold text-foreground">Coming up</h3>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {upcoming.slice(0, 6).map(({ definition, progress }) => (
            <div
              key={definition.id}
              className="rounded-lg border border-border/80 bg-secondary/30 px-3 py-2.5 text-xs text-muted-foreground"
            >
              <p className="font-medium text-foreground/90">{definition.title}</p>
              <p className="mt-0.5">{definition.requirement}</p>
              {progress !== undefined ? (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full bg-primary/70 transition-[width]"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
