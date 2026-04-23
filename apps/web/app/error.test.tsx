import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import RouteError from "./error";

describe("RouteError", () => {
  it("calls reset when Try again is pressed", () => {
    const reset = vi.fn();
    const err = new Error("demo failure");
    render(<RouteError error={err} reset={reset} />);
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("shows dev error message in development", () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubEnv("NODE_ENV", "development");
    const err = new Error("visible");
    render(<RouteError error={err} reset={() => {}} />);
    expect(screen.getByText("visible")).toBeInTheDocument();
    log.mockRestore();
    vi.unstubAllEnvs();
  });
});
