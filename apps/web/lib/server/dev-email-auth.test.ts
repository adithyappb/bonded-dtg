import { describe, expect, it } from "vitest";
import { issueOtp, signDevEmailToken, verifyDevEmailToken, verifyOtp } from "./dev-email-auth";

describe("dev-email-auth", () => {
  it("issues and verifies OTP", () => {
    process.env.AUTH_DEV_SECRET = "test-secret-for-vitest";
    const code = issueOtp("User@Example.com");
    expect(code).toMatch(/^\d{6}$/);
    expect(verifyOtp("user@example.com", code)).toBe(true);
    expect(verifyOtp("user@example.com", "000000")).toBe(false);
  });

  it("signs and verifies email token", () => {
    process.env.AUTH_DEV_SECRET = "another-test-secret";
    const tok = signDevEmailToken("a@b.co");
    expect(verifyDevEmailToken(tok)).toEqual({ email: "a@b.co" });
    expect(verifyDevEmailToken("bad")).toBeNull();
  });
});
