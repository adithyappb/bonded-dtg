"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { routes } from "@/lib/routes";
import { ReputationBadge } from "@/components/vouch/ReputationBadge";
import { useGhostScore } from "@/lib/ghost-score";
import { useTrustProfile } from "@/lib/hooks/useTrustProfile";
import { trustTierLabel } from "@/lib/trust";

export default function PublicReputationPage() {
  const ghostScore = useGhostScore();
  const trust = useTrustProfile();
  const params = useParams();
  const profileId = params.profileId;

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <h1 className="font-heading text-2xl font-bold text-foreground">Reputation</h1>
      <p className="font-mono text-xs text-muted-foreground mt-2 break-all">{String(profileId)}</p>
      <div className="grid grid-cols-3 gap-3 mt-8">
        <ReputationBadge
          score={trust.score}
          label="Trust"
          type="trust"
          caption={trustTierLabel(trust.tier)}
        />
        <ReputationBadge score={ghostScore} label="Ghost" type="ghost" />
        <ReputationBadge score={14} label="Streak" type="streak" />
      </div>
      <Link href={routes.discover} className="inline-block mt-10 text-primary hover:underline">
        Back to Discover
      </Link>
    </div>
  );
}
