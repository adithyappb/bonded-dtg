/**
 * Stake engine edge cases + invariant checks. Fake timers keep runs fast.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { STAKE_PER_SIDE_USDC } from "./constants";
import { CogcoinStakeEngine } from "./CogcoinStakeEngine";

const alice = { id: "a", displayName: "Alice", ghostScore: 10 };
const bob = { id: "b", displayName: "Bob", ghostScore: 25 };

async function flushTimers() {
  await vi.runAllTimersAsync();
}

describe("CogcoinStakeEngine (robust)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("createStake rejects non-positive amount", async () => {
    const eng = new CogcoinStakeEngine();
    await expect(eng.createStake(0, [alice, bob])).rejects.toThrow(/positive/);
  });

  it("createStake requires two participants", async () => {
    const eng = new CogcoinStakeEngine();
    await expect(eng.createStake(10, [alice] as unknown as [typeof alice, typeof bob])).rejects.toThrow(/two participants/);
  });

  it("fundSide rejects unknown stake id", async () => {
    const eng = new CogcoinStakeEngine();
    await expect(eng.fundSide("missing", "a")).rejects.toThrow(/Unknown stakeId/);
  });

  it("fundSide rejects funding the same side twice", async () => {
    const eng = new CogcoinStakeEngine();
    const p = eng.createStake(STAKE_PER_SIDE_USDC, [alice, bob]);
    await flushTimers();
    const s = await p;
    const p1 = eng.fundSide(s.id, "a");
    await flushTimers();
    await p1;
    await expect(eng.fundSide(s.id, "a")).rejects.toThrow(/already funded/);
  });

  it("fundSide rejects participant not in stake", async () => {
    const eng = new CogcoinStakeEngine();
    const p = eng.createStake(STAKE_PER_SIDE_USDC, [alice, bob]);
    await flushTimers();
    const s = await p;
    await expect(eng.fundSide(s.id, "z")).rejects.toThrow(/not in this stake/);
  });

  it("claimPeerNeverFunded rejects when both sides funded", async () => {
    const eng = new CogcoinStakeEngine();
    const p = eng.createStake(STAKE_PER_SIDE_USDC, [alice, bob]);
    await flushTimers();
    const s = await p;
    const p1 = eng.fundSide(s.id, "a");
    await flushTimers();
    await p1;
    const p2 = eng.fundSide(s.id, "b");
    await flushTimers();
    await p2;
    await expect(eng.claimPeerNeverFunded(s.id, "a")).rejects.toThrow(/awaiting_peer/);
  });

  it("claimPeerNeverFunded rejects claimant who did not fund", async () => {
    const eng = new CogcoinStakeEngine();
    const p = eng.createStake(STAKE_PER_SIDE_USDC, [alice, bob]);
    await flushTimers();
    const s = await p;
    const p1 = eng.fundSide(s.id, "a");
    await flushTimers();
    await p1;
    await expect(eng.claimPeerNeverFunded(s.id, "b")).rejects.toThrow(/not funded/);
  });

  it("resolveStake SUCCESS updates both participants with SHOWED_UP", async () => {
    const eng = new CogcoinStakeEngine();
    const p = eng.createStake(STAKE_PER_SIDE_USDC, [alice, bob]);
    await flushTimers();
    const s = await p;
    const pl = eng.lockStake(s.id);
    await flushTimers();
    await pl;
    const pr = eng.resolveStake(s.id, "SUCCESS");
    await flushTimers();
    const res = await pr;
    expect(res.ghostUpdates).toHaveLength(2);
    expect(res.ghostUpdates.every((g) => g.outcome === "SHOWED_UP")).toBe(true);
    expect(res.stake.outcome).toBe("SUCCESS");
    expect(res.stake.winner).toBeNull();
  });

  it("resolveStake DISPUTED updates both with DISPUTED", async () => {
    const eng = new CogcoinStakeEngine();
    const p = eng.createStake(STAKE_PER_SIDE_USDC, [alice, bob]);
    await flushTimers();
    const s = await p;
    const pl = eng.lockStake(s.id);
    await flushTimers();
    await pl;
    const pr = eng.resolveStake(s.id, "DISPUTED");
    await flushTimers();
    const res = await pr;
    expect(res.ghostUpdates.every((g) => g.outcome === "DISPUTED")).toBe(true);
  });

  it("resolveStake FLAKED assigns winner to non-flaked party", async () => {
    const eng = new CogcoinStakeEngine();
    const p = eng.createStake(STAKE_PER_SIDE_USDC, [alice, bob]);
    await flushTimers();
    const s = await p;
    const pl = eng.lockStake(s.id);
    await flushTimers();
    await pl;
    const pr = eng.resolveStake(s.id, "FLAKED", { flakedParticipantId: "a" });
    await flushTimers();
    const res = await pr;
    expect(res.stake.winner).toBe("b");
    const flake = res.ghostUpdates.find((g) => g.outcome === "FLAKED");
    const up = res.ghostUpdates.find((g) => g.outcome === "SHOWED_UP");
    expect(flake?.userId).toBe("a");
    expect(up?.userId).toBe("b");
  });

  it("getStakeStatus returns null for unknown id", async () => {
    const eng = new CogcoinStakeEngine();
    expect(await eng.getStakeStatus("nope")).toBeNull();
  });

  it("refundStake works from awaiting_peer", async () => {
    const eng = new CogcoinStakeEngine();
    const p = eng.createStake(STAKE_PER_SIDE_USDC, [alice, bob]);
    await flushTimers();
    const s = await p;
    const p1 = eng.fundSide(s.id, "a");
    await flushTimers();
    await p1;
    const pr = eng.refundStake(s.id);
    await flushTimers();
    const r = await pr;
    expect(r.stake.status).toBe("refunded");
  });

  it("numeric participant ids match string comparison", async () => {
    const eng = new CogcoinStakeEngine();
    const A = { id: 1, displayName: "A", ghostScore: 0 };
    const B = { id: 2, displayName: "B", ghostScore: 0 };
    const p = eng.createStake(1, [A, B]);
    await flushTimers();
    const s = await p;
    const pl = eng.lockStake(s.id);
    await flushTimers();
    await pl;
    const pr = eng.resolveStake(s.id, "FLAKED", { flakedParticipantId: 2 });
    await flushTimers();
    const res = await pr;
    expect(res.stake.winner).toBe("1");
  });
});
