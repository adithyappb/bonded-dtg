/**
 * CogcoinStakeEngine — demo implementation with sequential funding + resolution.
 *
 * Rules (USDC copy): $15 per side, $30 when both funded.
 * If only one side funds and the other never does, the funder can claim the full $30 pot;
 * the counterparty takes a Ghost hit (same family as flaking).
 */
import { nextGhostScore } from "@/lib/ghost-score";
import type { GhostOutcome } from "@/lib/ghost-score";
import { expectedFullEscrow, peerNeverFundedSummary, payoutSummary } from "./stakeRules";
import type {
  GhostScoreDelta,
  RefundResult,
  ResolutionResult,
  ResolveStakeOptions,
  StakeEngine,
  StakeOutcome,
  StakeParticipant,
  StakeRecord,
} from "./types";

const DEMO_MODE = true;

function generateId(): string {
  return "stk_cog_" + Math.random().toString(36).slice(2, 10);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function callCogcoinCli(args: string[]): Promise<string> {
  const res = await fetch("/api/cli", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tool: "cogcoin", args }),
  });
  if (!res.ok) throw new Error(`CLI error: ${res.statusText}`);
  const reader = res.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let output = "";
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      if (!part.startsWith("data: ")) continue;
      try {
        const payload = JSON.parse(part.slice(6));
        if (payload.line) output += payload.line + "\n";
      } catch {
        /* ignore */
      }
    }
  }
  return output;
}

function pid(id: string | number): string {
  return String(id);
}

function participantIndex(stake: StakeRecord, participantId: string | number): 0 | 1 {
  const p = pid(participantId);
  if (pid(stake.participants[0].id) === p) return 0;
  if (pid(stake.participants[1].id) === p) return 1;
  throw new Error(`Participant ${participantId} is not in this stake`);
}

function sumContributions(c: [number, number]): number {
  return c[0] + c[1];
}

function isFullyFunded(stake: StakeRecord): boolean {
  return stake.contributions[0] >= stake.amountPerSide && stake.contributions[1] >= stake.amountPerSide;
}

function toDelta(p: StakeParticipant, outcome: GhostOutcome): GhostScoreDelta {
  const prev = p.ghostScore ?? 0;
  const { newScore } = nextGhostScore(prev, outcome);
  return { userId: String(p.id), outcome, prevScore: prev, newScore };
}

export class CogcoinStakeEngine implements StakeEngine {
  readonly id = "cogcoin";
  private _stakes = new Map<string, StakeRecord>();

  async createStake(
    amountPerSide: number,
    participants: [StakeParticipant, StakeParticipant],
  ): Promise<StakeRecord> {
    if (amountPerSide <= 0) throw new Error("Stake amount per side must be positive");
    if (!participants?.[0] || !participants?.[1]) throw new Error("Stake requires two participants");

    if (!DEMO_MODE) {
      await callCogcoinCli(["status"]);
    } else {
      await sleep(200);
    }

    const contributions: [number, number] = [0, 0];
    const record: StakeRecord = {
      id: generateId(),
      amountPerSide,
      contributions,
      totalLocked: 0,
      participants,
      status: "proposed",
      outcome: null,
      winner: null,
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    };
    this._stakes.set(record.id, record);
    return record;
  }

  /** Fund both sides immediately (used by legacy demos / tests). */
  async lockStake(stakeId: string): Promise<StakeRecord> {
    const stake = this._stakes.get(stakeId);
    if (!stake) throw new Error(`Unknown stakeId: ${stakeId}`);
    if (stake.status !== "proposed" && stake.status !== "awaiting_peer") {
      throw new Error(`Cannot lock stake with status "${stake.status}"`);
    }

    await sleep(DEMO_MODE ? 600 : 2000);
    stake.contributions = [stake.amountPerSide, stake.amountPerSide];
    stake.totalLocked = sumContributions(stake.contributions);
    stake.status = "locked";
    this._stakes.set(stakeId, stake);
    return stake;
  }

  async fundSide(stakeId: string, participantId: string): Promise<StakeRecord> {
    const stake = this._stakes.get(stakeId);
    if (!stake) throw new Error(`Unknown stakeId: ${stakeId}`);
    if (stake.status !== "proposed" && stake.status !== "awaiting_peer") {
      throw new Error(`Cannot fund side with status "${stake.status}"`);
    }

    const idx = participantIndex(stake, participantId);
    if (stake.contributions[idx] > 0) {
      throw new Error("This side already funded");
    }

    await sleep(DEMO_MODE ? 500 : 1500);
    stake.contributions[idx] = stake.amountPerSide;
    stake.totalLocked = sumContributions(stake.contributions);

    if (isFullyFunded(stake)) {
      stake.status = "locked";
    } else {
      stake.status = "awaiting_peer";
    }
    this._stakes.set(stakeId, stake);
    return stake;
  }

  async claimPeerNeverFunded(stakeId: string, claimantId: string): Promise<ResolutionResult> {
    const stake = this._stakes.get(stakeId);
    if (!stake) throw new Error(`Unknown stakeId: ${stakeId}`);
    if (stake.status !== "awaiting_peer") {
      throw new Error(`claimPeerNeverFunded requires status "awaiting_peer", got "${stake.status}"`);
    }
    if (isFullyFunded(stake)) throw new Error("Both sides funded — use resolveStake instead");

    const idx = participantIndex(stake, claimantId);
    if (stake.contributions[idx] === 0) {
      throw new Error("Claimant has not funded their side");
    }

    const otherIdx = (1 - idx) as 0 | 1;
    if (stake.contributions[otherIdx] !== 0) {
      throw new Error("Counterparty already funded");
    }

    await sleep(DEMO_MODE ? 700 : 2500);

    const fullPot = expectedFullEscrow(stake.amountPerSide);
    const winnerId = String(stake.participants[idx].id);
    const loser = stake.participants[otherIdx];

    const ghostUpdates: GhostScoreDelta[] = [
      toDelta(stake.participants[idx], "SHOWED_UP"),
      toDelta(loser, "FLAKED"),
    ];

    const updated: StakeRecord = {
      ...stake,
      status: "resolved",
      outcome: "FLAKED",
      winner: winnerId,
      totalLocked: fullPot,
      resolvedAt: new Date().toISOString(),
    };
    this._stakes.set(stakeId, updated);

    const payoutNote = peerNeverFundedSummary(
      stake.amountPerSide,
      fullPot,
      loser.displayName,
    );

    return { stake: updated, payoutNote, ghostUpdates };
  }

  async resolveStake(
    stakeId: string,
    outcome: StakeOutcome,
    options?: ResolveStakeOptions,
  ): Promise<ResolutionResult> {
    const stake = this._stakes.get(stakeId);
    if (!stake) throw new Error(`Unknown stakeId: ${stakeId}`);
    if (stake.status !== "locked") {
      throw new Error(`Cannot resolve stake with status "${stake.status}" (need both sides funded)`);
    }
    if (!isFullyFunded(stake)) throw new Error("Escrow incomplete");

    const flakedId = options?.flakedParticipantId;
    if (outcome === "FLAKED" && !flakedId) {
      throw new Error('resolveStake(FLAKED) requires options.flakedParticipantId');
    }
    if (outcome === "FLAKED" && flakedId) {
      const ok =
        pid(flakedId) === pid(stake.participants[0].id) || pid(flakedId) === pid(stake.participants[1].id);
      if (!ok) throw new Error("flakedParticipantId must be one of the two participants");
    }

    await sleep(DEMO_MODE ? 800 : 3000);

    const [a, b] = stake.participants;
    let ghostUpdates: GhostScoreDelta[] = [];
    let winner: string | number | null = null;

    if (outcome === "SUCCESS") {
      ghostUpdates = [toDelta(a, "SHOWED_UP"), toDelta(b, "SHOWED_UP")];
      winner = null;
    } else if (outcome === "FLAKED" && flakedId) {
      const flakeIdx = pid(flakedId) === pid(a.id) ? 0 : 1;
      const winnerIdx = (1 - flakeIdx) as 0 | 1;
      winner = String(stake.participants[winnerIdx].id);
      ghostUpdates = [
        toDelta(stake.participants[winnerIdx], "SHOWED_UP"),
        toDelta(stake.participants[flakeIdx], "FLAKED"),
      ];
    } else if (outcome === "DISPUTED") {
      ghostUpdates = [toDelta(a, "DISPUTED"), toDelta(b, "DISPUTED")];
      winner = null;
    }

    const full = expectedFullEscrow(stake.amountPerSide);
    const winnerP = winner != null && pid(winner) === pid(a.id) ? a : winner != null && pid(winner) === pid(b.id) ? b : null;
    const flakedP =
      flakedId != null && pid(flakedId) === pid(a.id) ? a : flakedId != null && pid(flakedId) === pid(b.id) ? b : null;
    const payoutNote = payoutSummary(outcome, stake.amountPerSide, stake.totalLocked, {
      winnerLabel: winnerP?.displayName,
      flakedLabel: flakedP?.displayName,
    });

    const updated: StakeRecord = {
      ...stake,
      status: "resolved",
      outcome,
      winner,
      totalLocked: outcome === "FLAKED" ? full : stake.totalLocked,
      resolvedAt: new Date().toISOString(),
    };
    this._stakes.set(stakeId, updated);

    return { stake: updated, payoutNote, ghostUpdates };
  }

  async refundStake(stakeId: string): Promise<RefundResult> {
    const stake = this._stakes.get(stakeId);
    if (!stake) throw new Error(`Unknown stakeId: ${stakeId}`);
    if (!["proposed", "awaiting_peer", "locked"].includes(stake.status)) {
      throw new Error(`Cannot refund stake with status "${stake.status}"`);
    }

    await sleep(DEMO_MODE ? 400 : 1500);
    const updated: StakeRecord = {
      ...stake,
      status: "refunded",
      resolvedAt: new Date().toISOString(),
    };
    this._stakes.set(stakeId, updated);
    return { stake: updated, note: "Stake refunded — any posted funds returned to each side." };
  }

  async getStakeStatus(stakeId: string): Promise<StakeRecord | null> {
    return this._stakes.get(stakeId) ?? null;
  }

  getAllStakes(): StakeRecord[] {
    return Array.from(this._stakes.values());
  }
}
