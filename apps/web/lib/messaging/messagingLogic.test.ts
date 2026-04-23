import { describe, expect, it } from "vitest";
import { DEMO_CONVERSATIONS } from "@/lib/demo-data";
import { AUTO_REPLY_COUNT, pickAutoReply } from "./autoReply";
import { isKnownThreadId, parseThreadQueryParam, resolveInitialThreadId } from "./threadSelection";

describe("messaging helpers", () => {
  it("pickAutoReply is deterministic for the same seed", () => {
    expect(pickAutoReply("hello")).toBe(pickAutoReply("hello"));
  });

  it("pickAutoReply eventually touches every canned reply (hash coverage)", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 8000; i++) {
      seen.add(pickAutoReply(`seed-${i}`));
      if (seen.size >= AUTO_REPLY_COUNT) break;
    }
    expect(seen.size).toBe(AUTO_REPLY_COUNT);
  });

  it("resolveInitialThreadId prefers valid URL id then falls back", () => {
    expect(resolveInitialThreadId("2", DEMO_CONVERSATIONS)).toBe(2);
    expect(resolveInitialThreadId("999", DEMO_CONVERSATIONS)).toBe(DEMO_CONVERSATIONS[0]!.id);
    expect(resolveInitialThreadId(null, DEMO_CONVERSATIONS)).toBe(DEMO_CONVERSATIONS[0]!.id);
  });

  it("parseThreadQueryParam rejects bad input", () => {
    expect(parseThreadQueryParam(null)).toBeNull();
    expect(parseThreadQueryParam("")).toBeNull();
    expect(parseThreadQueryParam("abc")).toBeNull();
    expect(parseThreadQueryParam("3")).toBe(3);
  });

  it("isKnownThreadId", () => {
    expect(isKnownThreadId(1, DEMO_CONVERSATIONS)).toBe(true);
    expect(isKnownThreadId(99, DEMO_CONVERSATIONS)).toBe(false);
  });
});
