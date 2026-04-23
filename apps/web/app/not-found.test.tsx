import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFound from "./not-found";

describe("NotFound", () => {
  it("links home with branded copy", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { name: "404" })).toBeInTheDocument();
    const home = screen.getByRole("link", { name: /return home/i });
    expect(home.getAttribute("href")).toBe("/");
  });
});
