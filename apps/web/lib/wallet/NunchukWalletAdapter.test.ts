import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { createNunchukWalletAdapter } from "./NunchukWalletAdapter";

describe("createNunchukWalletAdapter", () => {
  const realFetch = globalThis.fetch;

  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("fetch must be configured per test");
      }) as typeof fetch,
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    globalThis.fetch = realFetch;
  });

  it("connects successfully when the demo CLI responds ok", async () => {
    const mockReader = {
      read: vi
        .fn()
        .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: {"line":"OK"}\n\n') })
        .mockResolvedValueOnce({ done: true, value: new Uint8Array() }),
      releaseLock: vi.fn(),
    };
    const mockResponse = {
      ok: true,
      body: {
        getReader: () => mockReader,
      },
      text: vi.fn().mockResolvedValue(""),
    } as unknown as Response;
    vi.stubGlobal("fetch", vi.fn(async () => mockResponse) as typeof fetch);

    const adapter = createNunchukWalletAdapter();
    await adapter.connect();

    expect(adapter.getSnapshot().status).toBe("connected");
    expect(adapter.getSnapshot().identity.address).toMatch(/^0x[a-f0-9]{40}$/);
    expect(adapter.getSnapshot().identity.connectorName).toBe("Nunchuk");
  });

  it("raises an error when the demo CLI returns a non-ok response", async () => {
    const mockResponse = {
      ok: false,
      statusText: "Bad Request",
      text: vi.fn().mockResolvedValue("Invalid tool"),
    } as unknown as Response;
    vi.stubGlobal("fetch", vi.fn(async () => mockResponse) as typeof fetch);

    const adapter = createNunchukWalletAdapter();
    await adapter.connect();

    expect(adapter.getSnapshot().status).toBe("error");
    expect(adapter.getSnapshot().error).toContain("CLI error");
  });
});
