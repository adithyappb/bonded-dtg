import { afterEach, describe, expect, it } from "vitest";
import {
  confirmPeerMet,
  confirmSelfMet,
  getMeetState,
  isMutualMeet,
  resetMeetVerificationStore,
} from "./meetVerificationStore";

describe("meetVerificationStore", () => {
  afterEach(() => {
    resetMeetVerificationStore();
  });

  const tid = "thread-test-1";

  it("returns stable empty state reference for unknown thread", () => {
    const a = getMeetState(tid);
    const b = getMeetState(tid);
    expect(a).toBe(b);
    expect(a.selfConfirmed).toBe(false);
    expect(a.peerConfirmed).toBe(false);
  });

  it("confirmSelfMet then confirmPeerMet yields mutual", () => {
    confirmSelfMet(tid);
    expect(getMeetState(tid).selfConfirmed).toBe(true);
    expect(isMutualMeet(tid)).toBe(false);
    confirmPeerMet(tid);
    expect(isMutualMeet(tid)).toBe(true);
    expect(getMeetState(tid).peerConfirmed).toBe(true);
  });

  it("threads are isolated", () => {
    confirmSelfMet("a");
    confirmPeerMet("b");
    expect(isMutualMeet("a")).toBe(false);
    expect(isMutualMeet("b")).toBe(false);
  });
});
