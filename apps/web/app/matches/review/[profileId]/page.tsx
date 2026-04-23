"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, MapPin, MessageCircle, Shield, Sparkles, Star } from "lucide-react";
import { routes } from "@/lib/routes";
import { getScoredMatchByProfileId } from "@/lib/matching";

export default function MatchReviewPage() {
  const params = useParams();
  const raw = params.profileId;
  const profileId = typeof raw === "string" ? Number.parseInt(raw, 10) : Number.NaN;
  const match = Number.isFinite(profileId) ? getScoredMatchByProfileId(profileId) : undefined;

  if (!match) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-muted-foreground">This match was not found.</p>
        <Link href={routes.matches} className="mt-6 inline-block text-sm font-semibold text-primary hover:underline">
          Back to matches
        </Link>
      </div>
    );
  }

  const { profile, score, sharedInterests, reasons, flags } = match;

  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <div className="container mx-auto max-w-md px-4 py-6">
        <Link
          href={routes.matches}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to matches
        </Link>

        <div className="glass-card mt-6 overflow-hidden rounded-2xl">
          <div className="relative aspect-[4/5] w-full sm:aspect-[3/4]">
            <Image
              src={profile.image}
              alt={profile.name}
              fill
              className="object-cover"
              sizes="(max-width: 448px) 100vw, 400px"
              priority
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
              <div>
                <h1 className="font-heading text-2xl font-bold text-foreground drop-shadow-md">
                  {profile.name}, {profile.age}
                </h1>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {profile.location}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1 rounded-xl border border-primary/30 bg-primary/15 px-3 py-1.5 backdrop-blur-md">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-heading text-sm font-bold text-primary">{profile.trustScore}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">{score}% fit</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                <Sparkles className="h-3 w-3" />
                {profile.intent}
              </span>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                Stakes {profile.stakePreference}
              </span>
            </div>

            <p className="text-sm leading-relaxed text-secondary-foreground">{profile.bio}</p>

            <div className="rounded-2xl border border-border/60 bg-background/40 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Why Bonded picked them</p>
              <div className="mt-3 space-y-2">
                {reasons.map((reason) => (
                  <div key={reason.label} className="flex items-start gap-2 text-sm">
                    <Star className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                    <div>
                      <p className="font-medium text-foreground">{reason.label}</p>
                      <p className="text-muted-foreground">{reason.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {sharedInterests.map((interest) => (
                <span
                  key={interest}
                  className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                >
                  {interest}
                </span>
              ))}
              {flags.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                >
                  <Star className="h-3 w-3 text-accent" />
                  {badge}
                </span>
              ))}
            </div>

            <Link
              href={routes.messages}
              className="gradient-emerald flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-primary-foreground"
            >
              <MessageCircle className="h-4 w-4" />
              Message
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
