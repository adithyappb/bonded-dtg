"use client";

import Link from "next/link";
import { useAppState } from "@/components/app/AppStateProvider";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { DEMO_PROFILES } from "@/lib/demo-data";
import { formatSparkAmount, useSparkBalance } from "@/lib/spark";
import { routes } from "@/lib/routes";

export function HomeLivePreview() {
  const spark = useSparkBalance();
  const { matchProfileIds, likedProfileIds, datePlan } = useAppState();
  const featured = DEMO_PROFILES[0];
  const compatibility = featured.trustScore;

  return (
    <section className="py-16 border-t border-border/40">
      <div className="container mx-auto px-4">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Live demo state</p>
            <h2 className="mt-2 font-heading text-3xl md:text-4xl font-bold text-foreground">Tonight&apos;s plan</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed max-w-lg">
              Matches, messages, wallet, and date stake stay in sync as you explore — preserved from the original crypto
              dating shell, now on the Bonded grid.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={routes.discover}
                className="inline-flex min-h-11 items-center justify-center rounded-lg gradient-emerald px-5 text-sm font-semibold text-primary-foreground glow-emerald"
              >
                Open discovery
              </Link>
              <Link
                href={routes.messagesThread("maya")}
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-background/60 px-5 text-sm font-semibold text-foreground hover:border-primary/50"
              >
                Reply to Maya
              </Link>
            </div>
          </div>

          <article className="rounded-2xl border border-border/60 bg-card/70 p-6 shadow-2xl shadow-black/25 backdrop-blur-sm" aria-label="Featured match preview">
            <div className="relative overflow-hidden rounded-xl border border-border/50">
              <img alt={`${featured.name} profile`} src={featured.image} className="aspect-[4/5] w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/80 to-transparent p-5">
                <span className="inline-block rounded-md bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                  {compatibility}% fit
                </span>
                <h3 className="mt-2 text-xl font-bold text-foreground">
                  {featured.name}, {featured.age}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{featured.bio}</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded-lg border border-border/50 bg-background/40 py-3">
                <span className="block text-muted-foreground text-xs">Liked</span>
                <strong className="text-lg text-foreground">{likedProfileIds.length}</strong>
              </div>
              <div className="rounded-lg border border-border/50 bg-background/40 py-3">
                <span className="block text-muted-foreground text-xs">Matches</span>
                <strong className="text-lg text-foreground">{matchProfileIds.length}</strong>
              </div>
              <div className="rounded-lg border border-border/50 bg-background/40 py-3">
                <span className="block text-muted-foreground text-xs">Date</span>
                <strong className="text-lg text-foreground capitalize">{datePlan.status}</strong>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <WalletConnectButton className="w-full" showAddress />
              <div className="rounded-lg border border-border/50 bg-background/35 p-4">
                <p className="text-xs text-muted-foreground">Spark (demo)</p>
                <p className="mt-1 font-mono text-lg font-semibold text-accent">{formatSparkAmount(spark)}</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
