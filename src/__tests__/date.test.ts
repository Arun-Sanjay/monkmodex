import { describe, it, expect } from "vitest";
import {
  dayDifference,
  dayNumber,
  formatShortDate,
  dateRange,
} from "@/lib/date";

describe("date helpers", () => {
  it("dayDifference is 0 on same day", () => {
    expect(dayDifference("2026-05-04", "2026-05-04")).toBe(0);
  });
  it("dayDifference counts days", () => {
    expect(dayDifference("2026-05-01", "2026-05-04")).toBe(3);
  });
  it("dayDifference is negative when today is before start", () => {
    expect(dayDifference("2026-05-10", "2026-05-04")).toBe(-6);
  });

  it("dayNumber is 1-indexed", () => {
    expect(dayNumber("2026-05-04", "2026-05-04")).toBe(1);
    expect(dayNumber("2026-05-01", "2026-05-04")).toBe(4);
  });

  it("formatShortDate produces a legible day", () => {
    const out = formatShortDate("2026-05-04");
    expect(out).toMatch(/May/);
    expect(out).toMatch(/4/);
  });

  it("dateRange returns N consecutive ISO dates", () => {
    const rng = dateRange("2026-05-01", 3);
    expect(rng).toEqual(["2026-05-01", "2026-05-02", "2026-05-03"]);
  });
});
