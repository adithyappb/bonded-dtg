import { describe, expect, it, vi } from "vitest";
import { createBrowserWalletAdapter } from "./browser-adapter";

function createProvider() {
  return {
    request: vi.fn(async ({ method }: { method: string }) => {
      if (method === "eth_accounts") return [];
      if (method === "eth_requestAccounts") return ["0xABCDEFabcdefABCDEFabcdefABCDEFabcdefABCD"];
      if (method === "eth_chainId") return "0x2105";
      if (method === "eth_getBalance") return "0x0de0b6b3a7640000";
      if (method === "personal_sign") return "0xsigned";
      return null;
    }),
    on: vi.fn(),
    removeListener: vi.fn(),
    isMetaMask: true,
  };
}

describe("createBrowserWalletAdapter", () => {
  it("connects through an injected EIP-1193 provider", async () => {
    const provider = createProvider();
    const adapter = createBrowserWalletAdapter(provider);

    await adapter.connect();

    expect(provider.request).toHaveBeenCalledWith({ method: "eth_requestAccounts" });
    expect(adapter.getSnapshot()).toMatchObject({
      status: "connected",
      identity: {
        address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
        chainId: 8453,
        chainName: "Base",
        balanceEth: "1.0000",
        connectorName: "MetaMask",
      },
    });
  });

  it("reports a clear error when no provider is available", async () => {
    const adapter = createBrowserWalletAdapter(undefined);

    await adapter.connect();

    expect(adapter.getSnapshot().status).toBe("error");
    expect(adapter.getSnapshot().error).toContain("No browser wallet found");
  });
});
