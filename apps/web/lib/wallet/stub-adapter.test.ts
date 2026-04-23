import { describe, expect, it } from "vitest";
import { createStubWalletAdapter } from "./stub-adapter";
import { initialWalletState } from "./types";

describe("createStubWalletAdapter", () => {
  it("starts disconnected", () => {
    const a = createStubWalletAdapter();
    expect(a.getSnapshot()).toEqual(initialWalletState());
  });

  it("connect assigns identity", async () => {
    const a = createStubWalletAdapter();
    await a.connect();
    const s = a.getSnapshot();
    expect(s.status).toBe("connected");
    expect(s.identity.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });
});
