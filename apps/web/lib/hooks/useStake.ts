"use client";

import { useEffect, useState } from "react";
import { getActiveStake, subscribeStake, type StakeRecord } from "@/lib/stake";

export function useActiveStake(): StakeRecord | null {
  const [stake, setStake] = useState<StakeRecord | null>(() => getActiveStake());
  useEffect(() => subscribeStake(setStake), []);
  return stake;
}
