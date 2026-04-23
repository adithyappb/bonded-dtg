import { describe, expect, it } from "vitest";
import { routes } from "./routes";

describe("routes", () => {
  it("every path is non-empty and starts with /", () => {
    for (const v of Object.values(routes)) {
      if (typeof v === "function") {
        const p = v("test-id");
        expect(p.startsWith("/")).toBe(true);
        expect(p.length).toBeGreaterThan(1);
      } else {
        expect(v.startsWith("/")).toBe(true);
      }
    }
  });

  it("home is root", () => {
    expect(routes.home).toBe("/");
  });
});
