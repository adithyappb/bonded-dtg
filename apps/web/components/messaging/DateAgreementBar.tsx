"use client";

import { motion } from "framer-motion";
import { Timer } from "lucide-react";

export function DateAgreementBar({
  label,
  percent,
  deadlineLabel,
}: {
  label: string;
  percent: number;
  deadlineLabel: string;
}) {
  const p = Math.min(100, Math.max(0, percent));
  return (
    <div className="border-b border-border bg-card/40 px-4 py-3">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-medium text-foreground">{label}</span>
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Timer className="w-3 h-3" />
          {deadlineLabel}
        </span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <motion.div
          className="h-full gradient-emerald"
          initial={{ width: 0 }}
          animate={{ width: `${p}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
