// lib/stake/index.ts — barrel export
export { CogcoinStakeEngine } from "./CogcoinStakeEngine";
export { STAKE_PER_SIDE_USDC, FULL_ESCROW_USDC, formatUsdc } from "./constants";
export { DEMO_LOCAL_USER_ID } from "./session";
export {
  setStakeEngine,
  subscribeStake,
  beginStake,
  fundStakeSide,
  proposeAndLock,
  claimPeerNeverFunded,
  resolveStake,
  refundStake,
  getStakeStatus,
  getActiveStake,
  resetStakeManagerForTesting,
} from "./stakeManager";
export type {
  StakeEngine,
  StakeRecord,
  StakeParticipant,
  StakeStatus,
  StakeOutcome,
  ResolutionResult,
  RefundResult,
  ResolveStakeOptions,
  GhostScoreDelta,
} from "./types";
