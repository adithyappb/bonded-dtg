import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Loading from "./loading";

describe("Loading", () => {
  it("exposes status for assistive tech", () => {
    render(<Loading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
