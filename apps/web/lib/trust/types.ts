export type TrustTier = "solid" | "trusted" | "building" | "review";

export interface TrustFactor {
  label: string;
  /** Points toward 0–100 score (for transparency). */
  points: number;
  detail: string;
}

export interface TrustResult {
  score: number;
  tier: TrustTier;
  /** Legitimacy / verification factors the UI can list. */
  factors: TrustFactor[];
  summary: string;
}

export interface TrustInputs {
  ghostScore: number;
  verifiedHuman: boolean;
  walletConnected: boolean;
  /** At least one mutual “we met” attestation on record. */
  mutualMeetConfirmed: boolean;
  datesCompleted: number;
  forfeitedStakes: number;
}
