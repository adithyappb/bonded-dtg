"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { routes } from "@/lib/routes";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[Bonded route error]", error);
    }
  }, [error]);

  return (
    <div className="container relative z-10 mx-auto max-w-lg px-4 py-20">
      <div className="glass-card glow-emerald border-primary/25 p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/10">
          <AlertTriangle className="h-7 w-7 text-destructive" aria-hidden />
        </div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Something broke</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          This view failed to render. Try again, or head home — your wallet and session are unchanged.
        </p>
        {process.env.NODE_ENV === "development" && error.message ? (
          <pre className="mt-4 max-h-32 overflow-auto rounded-lg border border-border/60 bg-background/80 p-3 text-left text-xs text-muted-foreground">
            {error.message}
          </pre>
        ) : null}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Try again
          </button>
          <Link
            href={routes.home}
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition hover:border-primary/50 hover:bg-primary/5"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
