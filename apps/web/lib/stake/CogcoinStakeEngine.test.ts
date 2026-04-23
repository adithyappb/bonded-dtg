import { describe, expect, it } from "vitest";
import { FULL_ESCROW_USDC, STAKE_PER_SIDE_USDC } from "./constants";
import { CogcoinStakeEngine } from "./CogcoinStakeEngine";

const alice = { id: "a", displayName: "Alice", ghostScore: 10 };
const bob = { id: "b", displayName: "Bob", ghostScore: 30 };

describe("CogcoinStakeEngine", () => {
  it("sequential funding: one side then peer → locked with full escrow", async () => {
    const eng = new CogcoinStakeEngine();
    const s = await eng.createStake(STAKE_PER_SIDE_USDC, [alice, bob]);
    expect(s.totalLocked).toBe(0);
    expect(s.status).toBe("proposed");

    const s1 = await eng.fundSide(s.id, "a");
    expect(s1.status).toBe("awaiting_peer");
    expect(s1.totalLocked).toBe(STAKE_PER_SIDE_USDC);

    const s2 = await eng.fundSide(s.id, "b");
    expect(s2.status).toBe("locked");
    expect(s2.totalLocked).toBe(FULL_ESCROW_USDC);
  });

  it("claimPeerNeverFunded pays full pot and bumps flaker ghost", async () => {
    const eng = new CogcoinStakeEngine();
    const s = await eng.createStake(STAKE_PER_SIDE_USDC, [alice, bob]);
    await eng.fundSide(s.id, "a");
    const res = await eng.claimPeerNeverFunded(s.id, "a");
    expect(res.stake.status).toBe("resolved");
    expect(res.stake.outcome).toBe("FLAKED");
    expect(res.stake.winner).toBe("a");
    expect(res.ghostUpdates.some((g) => g.userId === "b" && g.outcome === "FLAKED")).toBe(true);
    expect(res.payoutNote).toContain("30");
  });

  it("lockStake funds both sides (legacy)", async () => {
    const eng = new CogcoinStakeEngine();
    const s = await eng.createStake(0.2, [alice, bob]);
    const locked = await eng.lockStake(s.id);
    expect(locked.status).toBe("locked");
    expect(locked.totalLocked).toBeCloseTo(0.4, 5);
  });

  it("resolve FLAKED requires flaked id", async () => {
    const eng = new CogcoinStakeEngine();
    const s = await eng.createStake(STAKE_PER_SIDE_USDC, [alice, bob]);
    await eng.lockStake(s.id);
    await expect(eng.resolveStake(s.id, "FLAKED")).rejects.toThrow(/flakedParticipantId/);
    const ok = await eng.resolveStake(s.id, "FLAKED", { flakedParticipantId: "b" });
    expect(ok.stake.winner).toBe("a");
  });
});
