"use client";

import Link from "next/link";
import { MessageCircle, Sparkles } from "lucide-react";
import { routes } from "@/lib/routes";
import { MATCHED_PROFILES } from "@/lib/matching";

export default function MatchesPage() {
  const topMatches = MATCHED_PROFILES.slice(0, 3);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Refined queue</p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-foreground">Your strongest Bonded matches</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Compatibility is ranked by intent, values, trust, and response reliability so the best conversations start faster.
          </p>
        </div>
        <Link href={routes.discover} className="text-sm font-medium text-primary hover:underline">
          Back to Discover
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {topMatches.map((match) => (
          <article key={match.profile.id} className="glass-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-xl font-semibold text-foreground">
                  {match.profile.name}, {match.profile.age}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{match.profile.location}</p>
              </div>
              <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent">
                {match.score}% fit
              </span>
            </div>

            <p className="mt-4 text-sm leading-6 text-secondary-foreground">{match.profile.bio}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {match.sharedInterests.slice(0, 3).map((interest) => (
                <span
                  key={interest}
                  className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                >
                  {interest}
                </span>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-border/60 bg-background/40 p-3">
              <div className="flex items-center gap-2 text-accent">
                <Sparkles className="h-3.5 w-3.5" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em]">Top reason</p>
              </div>
              <p className="mt-2 text-sm text-foreground">{match.reasons[0]?.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{match.reasons[0]?.detail}</p>
            </div>

            <div className="mt-5 flex gap-3">
              <Link
                href={routes.messages}
                className="gradient-emerald inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                <MessageCircle className="h-4 w-4" />
                Message
              </Link>
              <Link
                href={routes.matchReview(match.profile.id)}
                className="inline-flex items-center justify-center rounded-lg border border-primary/25 px-4 py-2.5 text-primary transition-colors hover:bg-primary/10"
              >
                Review
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
