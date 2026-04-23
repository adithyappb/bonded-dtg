import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Providers } from "@/app/providers";
import { AppShell } from "./AppShell";

describe("AppShell", () => {
  it("renders navbar brand and child content", () => {
    render(
      <Providers>
        <AppShell>
          <div data-testid="page-body">Page</div>
        </AppShell>
      </Providers>,
    );
    expect(screen.getByTestId("page-body")).toBeInTheDocument();
    expect(screen.getByText("Bonded")).toBeInTheDocument();
  });
});
