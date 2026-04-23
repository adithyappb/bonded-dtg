import { describe, expect, it } from "vitest";
import { routes } from "./routes";
import { isRouteActive } from "./nav-utils";

describe("isRouteActive", () => {
  it("home only matches exact /", () => {
    expect(isRouteActive("/", routes.home)).toBe(true);
    expect(isRouteActive("/discover", routes.home)).toBe(false);
  });

  it("matches path prefix for nested routes", () => {
    expect(isRouteActive("/messages/1", routes.messages)).toBe(true);
    expect(isRouteActive("/messages", routes.messages)).toBe(true);
    expect(isRouteActive("/matchmaker", routes.messages)).toBe(false);
  });
});
