"use client";

import Image from "next/image";
import { MapPin } from "lucide-react";
import type { ScoredMatch } from "@/lib/matching";

type DiscoverPeekCardProps = {
  match: ScoredMatch;
};

/** Static card behind the active swipe for depth (no interaction). */
export function DiscoverPeekCard({ match }: DiscoverPeekCardProps) {
  const { profile, score } = match;
  return (
    <div
      className="glass-card pointer-events-none absolute inset-x-3 top-4 overflow-hidden rounded-2xl opacity-[0.42] shadow-lg"
      aria-hidden
    >
      <div className="relative h-[min(28rem,68vh)] sm:h-[28rem]">
        <Image
          src={profile.image}
          alt=""
          fill
          className="object-cover scale-105 blur-[1px]"
          sizes="(max-width: 448px) 100vw, 400px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-2">
          <div>
            <p className="font-heading text-lg font-bold text-foreground">
              {profile.name}, {profile.age}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> {profile.location}
            </p>
          </div>
          <span className="rounded-full bg-accent/20 px-2.5 py-1 text-xs font-semibold text-accent">{score}%</span>
        </div>
      </div>
    </div>
  );
}
