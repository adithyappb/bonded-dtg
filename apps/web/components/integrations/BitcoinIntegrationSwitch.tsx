"use client";

import { cn } from "@/lib/cn";
import type { BitcoinIntegrationMode } from "@/lib/bitcoin-integration";

type BitcoinIntegrationSwitchProps = {
  mode: BitcoinIntegrationMode;
  onChange: (mode: BitcoinIntegrationMode) => void;
  className?: string;
  disabled?: boolean;
  id?: string;
};

const options: { id: BitcoinIntegrationMode; label: string; sub: string }[] = [
  { id: "nunchuk", label: "Nunchuk", sub: "PSBT · multisig · CLI" },
  { id: "cogcoin", label: "Cogcoin", sub: "OP_RETURN · identity layer" },
];

export function BitcoinIntegrationSwitch({
  mode,
  onChange,
  className,
  disabled,
  id = "bitcoin-integration-mode",
}: BitcoinIntegrationSwitchProps) {
  return (
    <div
      role="radiogroup"
      aria-labelledby={`${id}-label`}
      className={cn("grid grid-cols-2 gap-1 rounded-xl border border-border/70 bg-muted/40 p-1", className)}
    >
      <p id={`${id}-label`} className="sr-only">
        Bitcoin integration target
      </p>
      {options.map((opt) => {
        const selected = mode === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(opt.id)}
            className={cn(
              "rounded-lg px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              selected
                ? "bg-card shadow-sm ring-1 ring-primary/35"
                : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
              disabled && "pointer-events-none opacity-50",
            )}
          >
            <span className="block text-sm font-semibold text-foreground">{opt.label}</span>
            <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">{opt.sub}</span>
          </button>
        );
      })}
    </div>
  );
}
