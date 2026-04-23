"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Lock, Clock, CheckCircle2, XCircle } from "lucide-react";

export interface StakeCardProps {
  matchName: string;
  amount: string;
  status: "pending" | "active" | "completed" | "forfeited";
  date: string;
  avatar: string;
}

const statusConfig = {
  pending: { icon: Clock, label: "Pending", className: "text-accent bg-accent/10" },
  active: { icon: Lock, label: "Staked", className: "text-primary bg-primary/10" },
  completed: { icon: CheckCircle2, label: "Completed", className: "text-primary bg-primary/10" },
  forfeited: { icon: XCircle, label: "Forfeited", className: "text-destructive bg-destructive/10" },
};

export function StakeCard({ matchName, amount, status, date, avatar }: StakeCardProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 flex items-center gap-4 hover:border-primary/30 transition-colors"
    >
      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-secondary flex-shrink-0">
        <Image src={avatar} alt={matchName} fill className="object-cover" sizes="48px" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-heading font-semibold text-foreground truncate">{matchName}</p>
        <p className="text-sm text-muted-foreground">{date}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-heading font-bold text-foreground">{amount}</p>
        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${config.className}`}>
          <StatusIcon className="w-3 h-3" />
          {config.label}
        </span>
      </div>
    </motion.div>
  );
}
