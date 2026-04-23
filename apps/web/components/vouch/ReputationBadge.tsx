"use client";

import { motion } from "framer-motion";
import { ghostRiskLabel } from "@/lib/ghost-score";

export interface ReputationBadgeProps {
  score: number;
  label: string;
  type: "trust" | "ghost" | "streak";
  /** Extra line under the label (e.g. trust tier). */
  caption?: string;
}

export function ReputationBadge({ score, label, type, caption }: ReputationBadgeProps) {
  const ghostHint = type === "ghost" ? ghostRiskLabel(score).label : null;

  const getColor = () => {
    switch (type) {
      case "trust":
        return score > 70 ? "text-primary" : "text-accent";
      case "ghost":
        return score < 20 ? "text-primary" : "text-destructive";
      case "streak":
        return "text-accent";
    }
  };

  const getGlow = () => {
    switch (type) {
      case "trust":
        return score > 70 ? "glow-emerald" : "";
      case "ghost":
        return score < 20 ? "glow-emerald" : "";
      case "streak":
        return "glow-gold";
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`glass-card p-5 flex flex-col items-center gap-2 ${getGlow()}`}
    >
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
          <motion.circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 34}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - score / 100) }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className={getColor()}
          />
        </svg>
        <span
          className={`absolute inset-0 flex items-center justify-center font-heading font-bold text-xl ${getColor()}`}
        >
          {score}
        </span>
      </div>
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
      {caption ? (
        <span className="text-center text-[11px] leading-tight text-muted-foreground/90">{caption}</span>
      ) : null}
      {ghostHint ? (
        <span className="text-center text-[11px] leading-tight text-muted-foreground/90">{ghostHint}</span>
      ) : null}
    </motion.div>
  );
}
