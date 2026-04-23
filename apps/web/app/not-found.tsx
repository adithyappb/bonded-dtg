import Link from "next/link";
import { Orbit } from "lucide-react";
import { routes } from "@/lib/routes";

export default function NotFound() {
  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center px-4">
      <div className="glass-card-strong glow-emerald max-w-md p-10 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10">
          <Orbit className="h-8 w-8 text-primary" aria-hidden />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/90">Off-chain</p>
        <h1 className="font-heading mt-2 text-5xl font-bold text-gradient-emerald">404</h1>
        <p className="mt-3 text-muted-foreground">This route isn’t in the Bonded app graph.</p>
        <Link
          href={routes.home}
          className="mt-8 inline-flex rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}
