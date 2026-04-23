"use client";

import { Fingerprint } from "lucide-react";
import { motion } from "framer-motion";

export function VerifiedHumanBadge({ verified }: { verified: boolean }) {
  if (!verified) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
        Unverified
      </span>
    );
  }
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 font-medium"
    >
      <Fingerprint className="w-3 h-3" />
      Verified Human
    </motion.span>
  );
}
