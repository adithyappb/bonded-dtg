"use client";

import { motion } from "framer-motion";
import { Fingerprint, ArrowRight } from "lucide-react";
import Link from "next/link";
import { routes } from "@/lib/routes";

/** Landing-only block: identity / profile lives visually at the bottom of the home page */
export function IdentityFooterCard() {
  return (
    <section className="relative border-t border-border/60 bg-secondary/20 py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45 }}
          className="glass-card mx-auto max-w-2xl overflow-hidden glow-emerald"
        >
          <div className="flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between md:p-10">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                <Fingerprint className="h-6 w-6 text-primary" aria-hidden />
              </div>
              <div>
                <h2 className="font-heading text-xl font-semibold text-foreground">Your profile &amp; identity</h2>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  ENS / Lens handles, World ID verification, and reputation, managed from your profile.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
              <Link
                href={routes.onboarding}
                className="rounded-lg border border-border px-5 py-2.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
              >
                Onboarding
              </Link>
              <Link
                href={routes.profile}
                className="gradient-emerald inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-heading font-semibold text-primary-foreground glow-emerald"
              >
                Open profile <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
