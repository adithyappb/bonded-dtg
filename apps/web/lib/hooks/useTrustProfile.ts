"use client";

import { useMemo } from "react";
import { DEMO_REPUTATION } from "@/lib/demo-reputation";
import { useGhostScore } from "@/lib/ghost-score";
import { computeTrustScore } from "@/lib/trust";
import { useWallet } from "@/lib/wallet";

export function useTrustProfile() {
  const ghostScore = useGhostScore();
  const { status } = useWallet();
  return useMemo(
    () =>
      computeTrustScore({
        ghostScore,
        verifiedHuman: DEMO_REPUTATION.verifiedHuman,
        walletConnected: status === "connected",
        mutualMeetConfirmed: DEMO_REPUTATION.mutualMeetConfirmations >= 1,
        datesCompleted: DEMO_REPUTATION.datesCompleted,
        forfeitedStakes: DEMO_REPUTATION.forfeitedStakes,
      }),
    [ghostScore, status],
  );
}
