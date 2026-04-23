"use client";

import { DAILY_SWIPE_CAP } from "@/lib/constants";

export function DailyLimitMeter({ remaining, cap = DAILY_SWIPE_CAP }: { remaining: number; cap?: number }) {
  return (
    <p className="text-muted-foreground text-sm">
      <span className="text-primary font-semibold">{remaining}</span> / {cap} swipes left today
    </p>
  );
}
