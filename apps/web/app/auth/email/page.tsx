"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { ArrowLeft, Loader2, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { enterAppSession } from "@/lib/app-session";
import { routes } from "@/lib/routes";

type Step = "email" | "code";

export default function DevEmailAuthPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const sendOtp = useCallback(async () => {
    setBusy(true);
    setError(null);
    setHint(null);
    try {
      const res = await fetch("/api/auth/dev-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { ok?: boolean; hint?: string; error?: { message?: string } };
      if (!res.ok) {
        setError(data.error?.message ?? "Request failed.");
        return;
      }
      setHint(data.hint ?? "Check the Next.js terminal for your code.");
      setStep("code");
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }, [email]);

  const verify = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/dev-otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: { message?: string } };
      if (!res.ok) {
        setError(data.error?.message ?? "Verification failed.");
        return;
      }
      enterAppSession();
      router.push(routes.discover);
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }, [code, email, router]);

  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card/85 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <Link
          href={routes.home}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to home
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-emerald">
            <ShieldCheck className="h-6 w-6 text-primary-foreground" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dev sign-in</h1>
            <p className="text-sm text-muted-foreground">Email + one-time code (development build).</p>
          </div>
        </div>

        <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200 leading-relaxed">
          This path is for local development only. Codes print in the terminal where <code className="font-mono">next dev</code> runs.
          Production must use a hosted identity provider and transactional email.
        </p>

        {step === "email" ? (
          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void sendOtp();
            }}
          >
            <label className="block text-sm font-medium text-foreground">
              Email
              <div className="mt-1.5 relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background/80 py-2.5 pl-10 pr-3 text-sm text-foreground outline-none ring-primary/30 focus:ring-2"
                  placeholder="you@example.com"
                />
              </div>
            </label>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <button
              type="submit"
              disabled={busy}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg gradient-emerald text-sm font-semibold text-primary-foreground glow-emerald disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              Send code
            </button>
          </form>
        ) : (
          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void verify();
            }}
          >
            <p className="text-sm text-muted-foreground">
              Code sent for <span className="font-medium text-foreground">{email}</span>. {hint}
            </p>
            <label className="block text-sm font-medium text-foreground">
              6-digit code
              <input
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="mt-1.5 w-full rounded-lg border border-border bg-background/80 px-3 py-2.5 text-center font-mono text-lg tracking-[0.35em] text-foreground outline-none ring-primary/30 focus:ring-2"
                placeholder="000000"
              />
            </label>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setError(null);
                }}
                className="min-h-11 flex-1 rounded-lg border border-border bg-background/60 text-sm font-semibold text-foreground hover:border-primary/50"
              >
                Change email
              </button>
              <button
                type="submit"
                disabled={busy || code.length !== 6}
                className="min-h-11 flex-1 rounded-lg gradient-emerald text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {busy ? "…" : "Verify"}
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 border-t border-border/50 pt-6">
          <button
            type="button"
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
            onClick={() => void fetch("/api/auth/dev-logout", { method: "POST" }).then(() => router.refresh())}
          >
            Clear dev email cookie
          </button>
        </div>
      </div>
    </div>
  );
}
