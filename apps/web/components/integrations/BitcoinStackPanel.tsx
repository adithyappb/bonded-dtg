"use client";

import { useState, useCallback, useRef } from "react";
import {
  ExternalLink,
  Terminal,
  ChevronDown,
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  BITCOIN_DEV_RESOURCES,
  COGCOIN_CLI_HINT,
  NUNCHUK_CLI_HINT,
  useBitcoinIntegration,
} from "@/lib/bitcoin-integration";
import { BitcoinIntegrationSwitch } from "./BitcoinIntegrationSwitch";
import { cn } from "@/lib/cn";

/* ─── Types ─────────────────────────────────────────────── */
type LinkItem = { href: string; label: string };
type RunState = "idle" | "running" | "success" | "error";

/* ─── Static data ────────────────────────────────────────── */
const DEV_SECTIONS = [
  {
    title: "Core Bitcoin",
    links: [
      { href: BITCOIN_DEV_RESOURCES.bitcoinCore, label: "Bitcoin Core" },
      { href: BITCOIN_DEV_RESOURCES.bitcoinDeveloperDocs, label: "Bitcoin Developer Docs" },
      { href: BITCOIN_DEV_RESOURCES.learnMeABitcoin, label: "Learn Me A Bitcoin" },
    ] as LinkItem[],
  },
  {
    title: "Lightning",
    links: [
      { href: BITCOIN_DEV_RESOURCES.lightningEngineeringApi, label: "Lightning Engineering API" },
      { href: BITCOIN_DEV_RESOURCES.lnd, label: "LND" },
      { href: BITCOIN_DEV_RESOURCES.lnbits, label: "LNbits" },
      { href: BITCOIN_DEV_RESOURCES.voltage, label: "Voltage" },
    ] as LinkItem[],
  },
  {
    title: "Libraries",
    links: [
      { href: BITCOIN_DEV_RESOURCES.rustBitcoin, label: "rust-bitcoin" },
      { href: BITCOIN_DEV_RESOURCES.bitcoinjsLib, label: "bitcoinjs-lib" },
      { href: BITCOIN_DEV_RESOURCES.pythonBitcoinlib, label: "python-bitcoinlib" },
    ] as LinkItem[],
  },
  {
    title: "Testing",
    links: [
      { href: BITCOIN_DEV_RESOURCES.mutinyNet, label: "MutinyNet (Signet)" },
      { href: BITCOIN_DEV_RESOURCES.polar, label: "Polar" },
    ] as LinkItem[],
  },
];

/* ─── Sub-components ─────────────────────────────────────── */
function LinkChip({ href, label }: LinkItem) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-background/50 px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary"
    >
      {label}
      <ExternalLink className="h-3 w-3 opacity-60" aria-hidden />
    </a>
  );
}

function BackendSpecificsDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6 rounded-xl border border-border/40 bg-muted/30">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <ChevronDown
            className={cn("h-4 w-4 shrink-0 transition-transform duration-200", open && "rotate-180")}
          />
          Backend Specifics &amp; Dev Resources
        </span>
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground/50">
          {open ? "Hide" : "Show"}
        </span>
      </button>

      {open && (
        <div className="border-t border-border/30 px-5 py-4 space-y-5">
          {DEV_SECTIONS.map((s) => (
            <div key={s.title}>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {s.title}
              </p>
              <ul className="flex flex-wrap gap-2">
                {s.links.map((l) => (
                  <li key={l.href}>
                    <LinkChip {...l} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── CLI Output Terminal ────────────────────────────────── */
function CliOutput({
  lines,
  state,
  onClear,
}: {
  lines: string[];
  state: RunState;
  onClear: () => void;
}) {
  if (state === "idle") return null;

  const stateIcon =
    state === "running" ? (
      <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
    ) : state === "success" ? (
      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
    ) : (
      <XCircle className="h-3.5 w-3.5 text-red-400" />
    );

  const stateLabel =
    state === "running" ? "Running…" : state === "success" ? "Completed" : "Error";

  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-neutral-700/60 bg-[#080c10] shadow-inner">
      {/* Terminal chrome */}
      <div className="flex items-center justify-between border-b border-neutral-700/60 bg-neutral-900/70 px-3 py-1.5">
        <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-400">
          {stateIcon}
          <span>{stateLabel}</span>
        </div>
        <button
          onClick={onClear}
          className="text-[11px] text-neutral-500 transition-colors hover:text-red-400"
        >
          Clear
        </button>
      </div>

      {/* Output lines */}
      <div className="max-h-56 overflow-y-auto p-3 font-mono text-[11px] leading-5 text-neutral-300">
        {lines.length === 0 && state === "running" && (
          <span className="animate-pulse text-neutral-500">Initialising…</span>
        )}
        {lines.map((line, i) => (
          <div key={i} className={cn(line.startsWith("⚠") ? "text-amber-400" : "text-neutral-300")}>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Panel ─────────────────────────────────────────── */
export function BitcoinStackPanel({ className }: { className?: string }) {
  const { mode, setMode } = useBitcoinIntegration();
  const nunchuk = mode === "nunchuk";

  const [runState, setRunState] = useState<RunState>("idle");
  const [outputLines, setOutputLines] = useState<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const clearOutput = useCallback(() => {
    setRunState("idle");
    setOutputLines([]);
  }, []);

  // Reset output when switching modes
  const handleModeChange = useCallback(
    (next: typeof mode) => {
      clearOutput();
      setMode(next);
    },
    [setMode, clearOutput]
  );

  const runCli = useCallback(async () => {
    if (runState === "running") {
      abortRef.current?.abort();
      return;
    }

    setOutputLines([]);
    setRunState("running");

    const tool = nunchuk ? "nunchuk" : "cogcoin";
    const args = nunchuk
      ? ["tx", "sign", "--wallet", "demo-wallet", "--tx-id", "a1b2c3d4", "--fingerprint", "DEADBEEF"]
      : ["sync"];

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/cli", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool, args }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        const msg = await res.text().catch(() => "Unknown error");
        setOutputLines([`Error: ${msg}`]);
        setRunState("error");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          if (!part.startsWith("data: ")) continue;
          try {
            const payload = JSON.parse(part.slice(6));
            if (payload.error) {
              setOutputLines((p) => [...p, `Error: ${payload.error}`]);
              setRunState("error");
            } else if (payload.done) {
              setRunState(payload.code === 0 ? "success" : "error");
            } else if (payload.line) {
              setOutputLines((p) => [...p, payload.line]);
            }
          } catch {
            // Ignore malformed SSE frames
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        setOutputLines((p) => [...p, "— Execution cancelled —"]);
        setRunState("idle");
      } else {
        setOutputLines((p) => [...p, `Unexpected error: ${err instanceof Error ? err.message : String(err)}`]);
        setRunState("error");
      }
    }
  }, [runState, nunchuk]);

  const accentNunchuk = "border-primary/40 bg-gradient-to-r from-primary/10 to-transparent";
  const accentCogcoin = "border-amber-500/40 bg-gradient-to-r from-amber-500/8 to-transparent";

  return (
    <section
      className={cn(
        "rounded-xl border border-border/60 bg-card/60 p-6 shadow-inner shadow-black/10",
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Bitcoin Stack
          </p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">Integration Focus</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Switch between{" "}
            <strong className="font-semibold text-foreground">Nunchuk</strong> (PSBT multisig) and{" "}
            <strong className="font-semibold text-foreground">Cogcoin</strong> (Bitcoin-native identity
            via <code className="rounded bg-muted px-1 py-0.5 text-[11px]">OP_RETURN</code>). Hit{" "}
            <strong className="font-semibold text-foreground">Run</strong> to execute the pipeline live.
          </p>
        </div>
        <div className="w-full shrink-0 sm:max-w-sm">
          <BitcoinIntegrationSwitch mode={mode} onChange={handleModeChange} />
        </div>
      </div>

      {/* CLI Card */}
      <div
        className={cn(
          "mt-6 rounded-xl border p-5 transition-all duration-300",
          nunchuk ? accentNunchuk : accentCogcoin
        )}
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          {/* Icon badge */}
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
              nunchuk
                ? "border-primary/30 bg-primary/20 text-primary"
                : "border-amber-500/30 bg-amber-500/20 text-amber-400"
            )}
          >
            <Terminal className="h-5 w-5" aria-hidden />
          </div>

          <div className="min-w-0 flex-1">
            {/* Title + links */}
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-base font-bold text-foreground">
                {nunchuk ? "Nunchuk Multisig Pipeline" : "Cogcoin Agent Sync"}
              </h3>
              {!nunchuk && (
                <div className="flex items-center gap-3 text-[11px]">
                  <a
                    href={BITCOIN_DEV_RESOURCES.cogcoinOrg}
                    className="inline-flex items-center gap-1 font-semibold text-amber-400 transition-colors hover:text-amber-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3" /> cogcoin.org
                  </a>
                  <a
                    href={BITCOIN_DEV_RESOURCES.cogcoinWhitepaper}
                    className="inline-flex items-center gap-1 font-semibold text-amber-400 transition-colors hover:text-amber-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3" /> whitepaper
                  </a>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              {nunchuk
                ? "Sequentially sign a PSBT with your hardware wallet using a fingerprint threshold."
                : "Bootstrap assumeUTXO chain state and unlock Bitcoin-native agent identity mining."}
            </p>

            {/* Command block */}
            <code
              className={cn(
                "mt-3 block select-all rounded-md border px-3 py-2 font-mono text-[11px] leading-5 shadow-inner",
                nunchuk
                  ? "border-neutral-700/50 bg-[#0f1115] text-emerald-400"
                  : "border-neutral-700/50 bg-[#0f1115] text-amber-400"
              )}
            >
              {nunchuk ? NUNCHUK_CLI_HINT : COGCOIN_CLI_HINT}
            </code>

            {/* Run button */}
            <button
              onClick={runCli}
              disabled={false}
              className={cn(
                "mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-150 active:scale-95",
                runState === "running"
                  ? "border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  : nunchuk
                  ? "border border-primary/40 bg-primary/20 text-primary hover:bg-primary/30"
                  : "border border-amber-500/40 bg-amber-500/15 text-amber-400 hover:bg-amber-500/25"
              )}
            >
              {runState === "running" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Stop
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" /> Run Pipeline
                </>
              )}
            </button>

            {/* Output Terminal */}
            <CliOutput lines={outputLines} state={runState} onClear={clearOutput} />
          </div>
        </div>
      </div>

      {/* Collapsible Backend Specifics */}
      <BackendSpecificsDrawer />
    </section>
  );
}
