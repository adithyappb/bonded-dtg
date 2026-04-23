import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  BitcoinIntegrationProvider,
  useBitcoinIntegration,
  __bitcoinIntegrationStorageKey,
} from "./BitcoinIntegrationProvider";

function ModeReader() {
  const { mode, setMode } = useBitcoinIntegration();
  return (
    <div>
      <span data-testid="mode">{mode}</span>
      <button type="button" onClick={() => setMode("cogcoin")}>
        set-cogcoin
      </button>
      <button type="button" onClick={() => setMode("nunchuk")}>
        set-nunchuk
      </button>
    </div>
  );
}

describe("BitcoinIntegrationProvider", () => {
  const key = __bitcoinIntegrationStorageKey();

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("defaults to nunchuk when storage is empty", () => {
    render(
      <BitcoinIntegrationProvider>
        <ModeReader />
      </BitcoinIntegrationProvider>,
    );
    expect(screen.getByTestId("mode").textContent).toBe("nunchuk");
  });

  it("persists mode to localStorage when set", () => {
    render(
      <BitcoinIntegrationProvider>
        <ModeReader />
      </BitcoinIntegrationProvider>,
    );
    fireEvent.click(screen.getByText("set-cogcoin"));
    expect(screen.getByTestId("mode").textContent).toBe("cogcoin");
    expect(localStorage.getItem(key)).toBe("cogcoin");
  });

  it("reads initial mode from localStorage", () => {
    localStorage.setItem(key, "cogcoin");
    render(
      <BitcoinIntegrationProvider>
        <ModeReader />
      </BitcoinIntegrationProvider>,
    );
    expect(screen.getByTestId("mode").textContent).toBe("cogcoin");
  });
});
