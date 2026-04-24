"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Shield, Sparkles, Info } from "lucide-react";

export interface ProfilePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    name: string;
    age: number;
    bio: string;
    location: string;
    trustScore: number;
    image: string;
    intent: string;
    stakePreference: string;
    lastActive: string;
    score?: number;
    interests: readonly string[];
    traits?: readonly string[];
    reasons?: readonly { label: string; detail: string }[];
  };
}

export function ProfilePreview({ isOpen, onClose, profile }: ProfilePreviewProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-[101] max-h-[92vh] overflow-y-auto rounded-t-[2.5rem] bg-card border-t border-primary/20 shadow-2xl"
          >
            <div className="sticky top-0 z-20 flex justify-end p-4">
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition-colors hover:bg-black/40"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="relative -mt-14 px-4 pb-24">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl shadow-xl">
                <Image
                  src={profile.image}
                  alt={profile.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 600px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <h2 className="font-heading text-4xl font-bold text-foreground drop-shadow-lg">
                        {profile.name}, {profile.age}
                      </h2>
                      <p className="mt-2 flex items-center gap-1.5 text-lg text-muted-foreground drop-shadow">
                        <MapPin className="h-4 w-4" /> {profile.location}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5 rounded-2xl border border-primary/40 bg-primary/20 px-4 py-2 backdrop-blur-md">
                      <Shield className="h-5 w-5 text-primary" />
                      <span className="font-heading text-xl font-bold text-primary">{profile.trustScore}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-8">
                <section>
                  <div className="flex flex-wrap gap-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-4 py-1.5 text-sm font-semibold text-accent">
                      <Sparkles className="h-4 w-4" />
                      {profile.intent}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground">
                      <Info className="h-4 w-4" />
                      Stakes {profile.stakePreference}
                    </span>
                  </div>
                  <p className="mt-6 text-lg leading-relaxed text-foreground/90">{profile.bio}</p>
                </section>

                <section>
                  <h3 className="font-heading text-xl font-bold text-foreground mb-4">Interests</h3>
                  <div className="flex flex-wrap gap-2.5">
                    {profile.interests.map((interest) => (
                      <span
                        key={interest}
                        className="rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </section>

                {profile.reasons && profile.reasons.length > 0 && (
                  <section className="rounded-3xl border border-border/60 bg-background/40 p-6">
                    <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-6">
                      <Sparkles className="h-4 w-4 text-accent" />
                      Why you match
                    </h3>
                    <div className="space-y-6">
                      {profile.reasons.map((reason) => (
                        <div key={reason.label} className="flex items-start gap-4">
                          <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
                          <div>
                            <p className="font-bold text-foreground">{reason.label}</p>
                            <p className="mt-1 text-muted-foreground leading-relaxed">{reason.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <section>
                  <h3 className="font-heading text-xl font-bold text-foreground mb-4">About me</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-border/60 bg-secondary/20 p-4">
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Last active</p>
                      <p className="mt-1 text-foreground font-medium">{profile.lastActive}</p>
                    </div>
                    {profile.traits && profile.traits.length > 0 && (
                      <div className="rounded-2xl border border-border/60 bg-secondary/20 p-4">
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Vibe</p>
                        <p className="mt-1 text-foreground font-medium truncate">{profile.traits[0]}</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
