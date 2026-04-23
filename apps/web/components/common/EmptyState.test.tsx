import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Heart } from "lucide-react";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders title", () => {
    render(<EmptyState icon={Heart} title="No items" />);
    expect(screen.getByText("No items")).toBeTruthy();
  });
});
