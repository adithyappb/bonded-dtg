/**
 * lib/wallet/NunchukWalletAdapter.ts
 * WalletAdapter implementation for the Nunchuk PSBT multisig pipeline.
 *
 * Wraps the nunchuk-mock.js CLI via /api/cli in demo mode.
 * Compatible with the existing WalletAdapter interface in types.ts.
 */
import { type WalletAdapter, type WalletState, initialWalletState } from "./types";

const DEMO_ADDRESS = "0x00000000000000000000000000000000deadbeef" as `0x${string}`;

async function callNunchukCli(args: string[]): Promise<string> {
  const res = await fetch("/api/cli", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tool: "nunchuk", args }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText || "Unknown CLI error");
    throw new Error(`CLI error: ${text}`);
  }

  const reader = res.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let output = "";
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";

      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith("data: ")) continue;
        try {
          const payload = JSON.parse(line.slice(6));
          if (payload.error) {
            output += `⚠ Error: ${payload.error}\n`;
          } else if (payload.line) {
            output += payload.line + "\n";
          }
        } catch {
          // Robustness: skip junk if data: preamble was misleading
        }
      }
    }
  } catch (err) {
    output += `⚠ Stream interrupted: ${err instanceof Error ? err.message : String(err)}\n`;
  } finally {
    reader.releaseLock();
  }

  return output.trim();
}

export function createNunchukWalletAdapter(): WalletAdapter {
  let state: WalletState = initialWalletState();
  const listeners = new Set<(s: WalletState) => void>();

  const emit = () => listeners.forEach((l) => l(state));
  const set = (patch: Partial<WalletState>) => {
    state = { ...state, ...patch };
    emit();
  };

  return {
    id: "nunchuk",

    getSnapshot: () => state,

    subscribe: (listener) => {
      listeners.add(listener);
      listener(state);
      return () => listeners.delete(listener);
    },

    connect: async () => {
      set({ status: "connecting", error: undefined });
      try {
        // Verification step: ensure CLI is responding
        const initOutput = await callNunchukCli([
          "tx",
          "sign",
          "--wallet",
          "demo-wallet",
          "--tx-id",
          "init-check",
          "--fingerprint",
          "DEADBEEF",
        ]);
        if (initOutput.includes("⚠ Error")) throw new Error("Nunchuk CLI unavailable");

        set({
          status: "connected",
          identity: {
            address: DEMO_ADDRESS,
            displayName: "Nunchuk Multisig",
            ensName: null,
            lensHandle: null,
            worldIdVerified: false,
            connectorName: "Nunchuk",
            lastConnectedAt: new Date().toISOString(),
          },
        });
      } catch (err) {
        set({
          status: "error",
          error: err instanceof Error ? err.message : "Nunchuk connection failed",
        });
      }
    },

    disconnect: async () => {
      set(initialWalletState());
    },

    signMessage: async (message: string) => {
      if (state.status !== "connected") throw new Error("Nunchuk wallet not connected.");
      const address = state.identity.address;
      if (!address) throw new Error("No address available.");

      // Invoke the CLI sign pipeline
      await callNunchukCli([
        "tx",
        "sign",
        "--wallet",
        "bonded-multisig",
        "--tx-id",
        message.slice(0, 16),
        "--fingerprint",
        "DEADBEEF",
      ]);

      // Return a realistic mock signature (Base64-like P2WPKH-style encoded for demo "wow")
      const seed = message.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
      const fakeSig = `0x${Buffer.from(`nunchuk_sig_${seed}_${Date.now()}`).toString("hex").slice(0, 64)}` as `0x${string}`;
      return fakeSig;
    },
  };
}
