"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X, Heart, Star, Sparkles, MessageCircle, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/common/EmptyState";
import { DailyLimitMeter } from "@/components/discovery/DailyLimitMeter";
import { DiscoverPeekCard } from "@/components/discovery/DiscoverPeekCard";
import {
  DiscoverCard,
  type DiscoverCardHandle,
} from "@/components/vouch/DiscoverCard";
import { DAILY_SWIPE_CAP } from "@/lib/constants";
import {
  buildWalletSeededDiscoverDeck,
  deckIndexToMatch,
  shouldShowBondedMatch,
  type SwipeMeta,
} from "@/lib/discover-swipe";
import { DEFAULT_MATCH, MATCHED_PROFILES } from "@/lib/matching";
import { MATCH_USER_PREFERENCES } from "@/lib/matching-data";
import { routes } from "@/lib/routes";
import { useSwipeLimit } from "@/lib/swipe-limit";
import { useWalletOptional } from "@/lib/wallet";
import { ProfilePreview } from "@/components/profile/ProfilePreview";

export default function DiscoverPage() {
  const router = useRouter();
  const cardRef = useRef<DiscoverCardHandle>(null);
  const [deckIndex, setDeckIndex] = useState(0);
  const { swipesUsed, isLocked, recordSwipe } = useSwipeLimit();
  const [bondedMatchName, setBondedMatchName] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const wallet = useWalletOptional();
  const walletAddress = wallet?.identity.address ?? null;
  const [detailProfile, setDetailProfile] = useState<any>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const discoverDeck = useMemo(
    () => buildWalletSeededDiscoverDeck(MATCHED_PROFILES, hydrated ? walletAddress : null),
    [hydrated, walletAddress],
  );
  const deckFallback = discoverDeck[0] ?? DEFAULT_MATCH;

  useEffect(() => {
    setDeckIndex(0);
  }, [discoverDeck]);

  const swipesLeft = DAILY_SWIPE_CAP - swipesUsed;
  const canSwipe = !isLocked;

  // Auto-redirect when limit is reached
  useEffect(() => {
    if (isLocked) {
      // Small delay to allow the last swipe animation to start/finish
      const timer = setTimeout(() => {
        router.push(routes.matches);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isLocked, router]);

  const currentMatch = deckIndexToMatch(deckIndex, discoverDeck) ?? deckFallback;
  const peekMatch = deckIndexToMatch(deckIndex + 1, discoverDeck) ?? deckFallback;

  const nextMatches = Array.from(
    { length: Math.min(3, discoverDeck.length - 1) },
    (_, offset) => {
      return (
        deckIndexToMatch(deckIndex + offset + 1, discoverDeck) ?? deckFallback
      );
    },
  ).filter((match) => match.profile.id !== currentMatch.profile.id);

  const dismissMatchToast = useCallback(() => {
    setBondedMatchName(null);
  }, []);

  const handleSwipeComplete = useCallback(
    (direction: "left" | "right", meta?: SwipeMeta) => {
      if (!canSwipe) return;

      const liked = direction === "right";
      if (
        liked &&
        shouldShowBondedMatch({
          liked: true,
          fitScore: currentMatch.score,
          profileId: currentMatch.profile.id,
          swipeIndex: deckIndex,
          superLike: meta?.superLike,
        })
      ) {
        setBondedMatchName(currentMatch.profile.name);
        window.setTimeout(() => setBondedMatchName(null), 4500);
      }

      recordSwipe();
      setDeckIndex((index) => index + 1);
    },
    [canSwipe, currentMatch, deckIndex, recordSwipe],
  );

  return (
    <div className="min-h-screen pb-28 md:pb-10">
      <div className="container mx-auto px-4">
        <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="glass-card overflow-hidden rounded-2xl">
            <div className="border-b border-border/50 px-5 py-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Bonded matching
                  </p>
                  <h1 className="mt-2 font-heading text-3xl font-bold text-foreground">
                    Discover with proof, not guesswork.
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    Ranked by shared interests, aligned intent, wallet-native
                    trust, and reliability signals so the best people rise
                    first.
                  </p>
                  {hydrated && walletAddress ? (
                    <p className="mt-2 max-w-2xl text-xs leading-5 text-primary/90">
                      With your wallet connected, the queue is seeded to your
                      address: people who already liked you are surfaced first,
                      then the rest shuffles deterministically (demo logic).
                    </p>
                  ) : null}
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/50 px-4 py-3">
                  <DailyLimitMeter remaining={Math.max(0, swipesLeft)} />
                </div>
              </div>
            </div>

            <div className="grid gap-3 px-5 py-4 md:grid-cols-3">
              <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Preference fit
                </p>
                <p className="mt-2 text-sm text-secondary-foreground">
                  Ages {MATCH_USER_PREFERENCES.ageMin}-
                  {MATCH_USER_PREFERENCES.ageMax}, intent-first matching, and no
                  smoking.
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Top interests
                </p>
                <p className="mt-2 text-sm text-secondary-foreground">
                  {MATCH_USER_PREFERENCES.interests.join(", ")}
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  What gets boosted
                </p>
                <p className="mt-2 text-sm text-secondary-foreground">
                  Verified humans, strong reply rates, and proven follow-through.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Queue preview
            </p>
            <h2 className="mt-2 font-heading text-xl font-semibold text-foreground">
              Coming up next
            </h2>
            <div className="mt-4 space-y-3">
              {nextMatches.map((match) => (
                <div
                  key={match.profile.id}
                  className="rounded-2xl border border-border/60 bg-background/40 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">
                        {match.profile.name}, {match.profile.age}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {match.profile.location}
                      </p>
                    </div>
                    <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent">
                      {match.score}%
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-secondary-foreground">
                    {match.reasons[0]?.detail ?? match.profile.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-col items-center">
          <div className="flex min-h-[min(640px,78vh)] w-full justify-center">
            <div className="relative w-full min-h-[min(620px,76vh)]">
              {canSwipe && peekMatch.profile.id !== currentMatch.profile.id ? (
                <DiscoverPeekCard match={peekMatch} />
              ) : null}
              <AnimatePresence mode="wait">
                {canSwipe ? (
                  <DiscoverCard
                    ref={cardRef}
                    key={deckIndex}
                    name={currentMatch.profile.name}
                    age={currentMatch.profile.age}
                    bio={currentMatch.profile.bio}
                    location={currentMatch.profile.location}
                    trustScore={currentMatch.profile.trustScore}
                    image={currentMatch.profile.image}
                    intent={currentMatch.profile.intent}
                    stakePreference={currentMatch.profile.stakePreference}
                    lastActive={currentMatch.profile.lastActive}
                    score={currentMatch.score}
                    sharedInterests={currentMatch.sharedInterests}
                    reasons={currentMatch.reasons}
                    flags={currentMatch.flags}
                    imagePriority={swipesUsed === 0}
                    onSwipe={handleSwipeComplete}
                    onTap={() => setDetailProfile(currentMatch.profile)}
                  />
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <EmptyState
                      icon={Sparkles}
                      title="Daily limit reached"
                      description="Your best-fit queue is saved. Jump into matches or come back tomorrow for a fresh ranking."
                      action={
                        <Link
                          href={routes.matches}
                          className="gradient-emerald inline-block rounded-xl px-6 py-2.5 text-sm font-heading font-semibold text-primary-foreground shadow-lg shadow-primary/25"
                        >
                          View matches
                        </Link>
                      }
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {canSwipe ? (
            <div className="mt-2 w-full border-t border-border/40 pt-4">
              <p className="mb-1 flex flex-wrap items-center justify-center gap-x-1 gap-y-0.5 text-center text-[11px] text-muted-foreground">
                <ChevronLeft className="h-3.5 w-3.5 shrink-0 text-destructive" aria-hidden />
                Pass left · like right
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
              </p>
              <p className="mb-3 flex items-center justify-center gap-1 text-center text-[11px] text-accent">
                <ChevronUp className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Swipe up on the card (or Spotlight) to spotlight
              </p>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => cardRef.current?.swipeLeft()}
                  className="group flex flex-col items-center gap-1.5 rounded-2xl border-2 border-destructive/45 bg-destructive/10 py-3 text-destructive shadow-sm transition-all hover:border-destructive/70 hover:bg-destructive/15 active:scale-[0.98] sm:py-4"
                  aria-label="Pass — swipe left"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-destructive/50 bg-background/90 shadow-md transition-transform group-hover:scale-105 sm:h-14 sm:w-14">
                    <X className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.5} />
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-destructive/90">
                    Swipe left
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground">Pass</span>
                </button>
                <button
                  type="button"
                  onClick={() => cardRef.current?.superLike()}
                  className="group flex flex-col items-center gap-1.5 rounded-2xl border border-accent/40 bg-accent/5 py-3 text-accent transition-all hover:border-accent/60 hover:bg-accent/10 active:scale-[0.98] sm:py-4"
                  aria-label="Spotlight like"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-accent/45 bg-background/80 shadow-inner transition-transform group-hover:scale-105 sm:h-12 sm:w-12">
                    <Star className="h-5 w-5 fill-accent/25 sm:h-6 sm:w-6" strokeWidth={2.25} />
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide">Spotlight</span>
                  <span className="text-[10px] text-muted-foreground">Or swipe up</span>
                </button>
                <button
                  type="button"
                  onClick={() => cardRef.current?.swipeRight()}
                  className="group flex flex-col items-center gap-1.5 rounded-2xl border-2 border-primary/45 bg-primary/10 py-3 text-primary shadow-sm transition-all hover:border-primary/70 hover:bg-primary/15 active:scale-[0.98] glow-emerald sm:py-4"
                  aria-label="Like — swipe right"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary/50 bg-background/90 shadow-md transition-transform group-hover:scale-105 sm:h-14 sm:w-14">
                    <Heart className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.5} />
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                    Swipe right
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground">Like</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <AnimatePresence>
        {bondedMatchName ? (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-4 right-4 z-[60] mx-auto max-w-md md:bottom-8"
          >
            <div className="glass-card relative overflow-hidden rounded-2xl border border-primary/35 p-5 shadow-2xl shadow-primary/20 glow-emerald">
              <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/25 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-accent/20 blur-2xl" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Mutual match
              </p>
              <p className="mt-2 font-heading text-xl font-bold text-foreground">
                You and {bondedMatchName} bonded
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Stake-backed chat opens when you are both ready — say hi while
                the signal is hot.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={routes.messages}
                  className="gradient-emerald inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground min-[380px]:flex-none"
                >
                  <MessageCircle className="h-4 w-4" />
                  Open chat
                </Link>
                <button
                  type="button"
                  onClick={dismissMatchToast}
                  className="rounded-xl border border-border/70 px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
                >
                  Later
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <ProfilePreview
        isOpen={Boolean(detailProfile)}
        onClose={() => setDetailProfile(null)}
        profile={detailProfile ?? {
          name: "",
          age: 0,
          bio: "",
          location: "",
          trustScore: 0,
          image: "",
          intent: "",
          stakePreference: "",
          lastActive: "",
          interests: [],
        }}
      />
    </div>
  );
}
