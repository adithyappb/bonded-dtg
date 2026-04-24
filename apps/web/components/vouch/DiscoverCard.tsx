"use client";

import Image from "next/image";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { MapPin, Shield, Sparkles, Star } from "lucide-react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import type { SwipeMeta } from "@/lib/discover-swipe";

export interface DiscoverCardProps {
  name: string;
  age: number;
  bio: string;
  location: string;
  trustScore: number;
  image: string;
  intent: string;
  stakePreference: string;
  lastActive: string;
  score: number;
  sharedInterests: readonly string[];
  reasons: readonly { label: string; detail: string }[];
  flags: readonly string[];
  imagePriority?: boolean;
  onSwipe: (direction: "left" | "right", meta?: SwipeMeta) => void;
  onTap?: () => void;
}

export type DiscoverCardHandle = {
  swipeLeft: () => void;
  swipeRight: () => void;
  superLike: () => void;
};

const EXIT_X = 480;
const SPOTLIGHT_EXIT_Y = -480;

export const DiscoverCard = forwardRef<DiscoverCardHandle, DiscoverCardProps>(
  function DiscoverCard(
    {
      name,
      age,
      bio,
      location,
      trustScore,
      image,
      intent,
      stakePreference,
      lastActive,
      score,
      sharedInterests,
      reasons,
      flags,
      imagePriority = false,
      onSwipe,
      onTap,
    },
    ref,
  ) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotate = useTransform(x, [-220, 220], [-14, 14]);
    const likeOpacity = useTransform(x, [0, 90], [0, 1]);
    const nopeOpacity = useTransform(x, [-90, 0], [1, 0]);
    const spotlightOpacity = useTransform(y, [0, -24, -72], [0, 0.45, 1]);
    const exiting = useRef(false);

    const springReset = useCallback(() => {
      void Promise.all([
        animate(x, 0, { type: "spring", stiffness: 520, damping: 38 }),
        animate(y, 0, { type: "spring", stiffness: 520, damping: 38 }),
      ]);
    }, [x, y]);

    const flyOff = useCallback(
      async (direction: "left" | "right", meta?: SwipeMeta) => {
        if (exiting.current) return;
        exiting.current = true;
        const target = direction === "right" ? EXIT_X : -EXIT_X;
        await Promise.all([
          animate(x, target, { duration: 0.26, ease: [0.22, 1, 0.36, 1] }),
          animate(y, 0, { duration: 0.22, ease: [0.22, 1, 0.36, 1] }),
        ]);
        onSwipe(direction, meta);
      },
      [onSwipe, x, y],
    );

    const flySpotlight = useCallback(async () => {
      if (exiting.current) return;
      exiting.current = true;
      await Promise.all([
        animate(y, SPOTLIGHT_EXIT_Y, { duration: 0.3, ease: [0.22, 1, 0.36, 1] }),
        animate(x, 0, { duration: 0.26, ease: [0.22, 1, 0.36, 1] }),
      ]);
      onSwipe("right", { superLike: true });
    }, [onSwipe, x, y]);

    useImperativeHandle(
      ref,
      () => ({
        swipeLeft: () => void flyOff("left"),
        swipeRight: () => void flyOff("right"),
        superLike: () => void flySpotlight(),
      }),
      [flyOff, flySpotlight],
    );

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const ox = info.offset.x;
      const oy = info.offset.y;
      const upward = oy < -72 && Math.abs(oy) >= Math.abs(ox) * 0.72;
      if (upward) {
        void flySpotlight();
        return;
      }
      if (ox > 96) void flyOff("right");
      else if (ox < -96) void flyOff("left");
      else void springReset();
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{
          opacity: 0,
          transition: { duration: 0.12 },
        }}
        style={{ x, y, rotate }}
        drag
        dragConstraints={{ left: -280, right: 280, top: -160, bottom: 72 }}
        dragElastic={0.68}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        onTap={onTap}
        className="absolute inset-x-0 top-0 z-10 mx-auto w-full max-w-sm cursor-grab touch-pan-y active:cursor-grabbing"
      >
        <div className="glass-card overflow-hidden rounded-2xl glow-emerald">
          <div className="relative h-[min(30rem,72vh)] overflow-hidden sm:h-[30rem]">
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 448px) 100vw, 400px"
              priority={imagePriority}
              draggable={false}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent" />

            <motion.div
              style={{ opacity: spotlightOpacity }}
              className="pointer-events-none absolute left-1/2 top-6 z-10 -translate-x-1/2 rounded-xl border-[3px] border-accent px-4 py-1.5 shadow-lg shadow-accent/30"
            >
              <span className="font-heading text-lg font-bold tracking-wide text-accent">SPOTLIGHT</span>
            </motion.div>

            <motion.div
              style={{ opacity: likeOpacity }}
              className="pointer-events-none absolute left-7 top-20 rotate-[-14deg] rounded-xl border-[3px] border-primary px-3 py-1.5 shadow-lg shadow-primary/20 sm:top-24"
            >
              <span className="font-heading text-xl font-bold tracking-wide text-primary">LIKE</span>
            </motion.div>
            <motion.div
              style={{ opacity: nopeOpacity }}
              className="pointer-events-none absolute right-7 top-20 rotate-[14deg] rounded-xl border-[3px] border-destructive px-3 py-1.5 shadow-lg shadow-destructive/25 sm:top-24"
            >
              <span className="font-heading text-xl font-bold tracking-wide text-destructive">PASS</span>
            </motion.div>

            <div className="pointer-events-none absolute left-3 right-3 top-3 flex items-start justify-between gap-3">
              <div className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md">
                {lastActive}
              </div>
              <div className="rounded-2xl border border-accent/35 bg-background/80 px-3 py-2 text-right shadow-md backdrop-blur-md">
                <p className="text-[10px] uppercase tracking-[0.2em] text-accent">Bonded fit</p>
                <p className="font-heading text-2xl font-bold text-foreground">{score}%</p>
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-4 left-4 right-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h3 className="font-heading text-2xl font-bold text-foreground drop-shadow-md">
                    {name}, {age}
                  </h3>
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground drop-shadow">
                    <MapPin className="h-3.5 w-3.5 shrink-0" /> {location}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1 rounded-xl border border-primary/30 bg-primary/15 px-3 py-1.5 backdrop-blur-md">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="font-heading text-sm font-bold text-primary">{trustScore}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                <Sparkles className="h-3 w-3" />
                {intent}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                Stakes {stakePreference}
              </span>
            </div>

            <p className="text-sm leading-relaxed text-secondary-foreground">{bio}</p>

            <div className="rounded-2xl border border-border/60 bg-background/40 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Why Bonded picked them
              </p>
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
                  className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
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
          </div>
        </div>
      </motion.div>
    );
  },
);
