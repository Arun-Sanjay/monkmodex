import { describe, it, expect } from "vitest";
import { formatAnchor } from "@/lib/protocol/extract";

describe("formatAnchor", () => {
  it("converts snake_case to spaces", () => {
    expect(formatAnchor("morning_coffee")).toBe("morning coffee");
    expect(formatAnchor("getting_into_bed")).toBe("getting into bed");
  });
  it("preserves already-clean anchors", () => {
    expect(formatAnchor("alarm")).toBe("alarm");
    expect(formatAnchor("evening wind-down")).toBe("evening wind-down");
  });
  it("trims whitespace", () => {
    expect(formatAnchor("  morning_coffee  ")).toBe("morning coffee");
  });
});
