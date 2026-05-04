import { describe, it, expect } from "vitest";
import { composeBriefing } from "@/lib/briefing";

const base = {
  totalDays: 90 as const,
  completedToday: 0,
  totalNN: 4,
  last7Done: 0,
  last7Possible: 0,
  phaseLabel: "Substrate",
  todayStarted: false,
};

describe("composeBriefing", () => {
  it("day 1 fresh: gives the easiest-first nudge", () => {
    const b = composeBriefing({ ...base, day: 1 });
    expect(b).toMatch(/Day 1/);
    expect(b.toLowerCase()).toContain("easiest");
  });

  it("day 1 started: acknowledges the start", () => {
    const b = composeBriefing({
      ...base,
      day: 1,
      todayStarted: true,
      completedToday: 1,
    });
    expect(b).toMatch(/started/);
  });

  it("day 14 boundary: substrate-edge messaging", () => {
    const b = composeBriefing({
      ...base,
      day: 14,
      last7Possible: 7,
      last7Done: 6,
      phaseLabel: "Substrate",
    });
    expect(b).toMatch(/Day 14/);
    expect(b).toMatch(/substrate phase/);
  });

  it("strong adherence (≥85%): names the recalibration", () => {
    const b = composeBriefing({
      ...base,
      day: 7,
      last7Possible: 6,
      last7Done: 6,
    });
    expect(b.toLowerCase()).toContain("recalibration working");
  });

  it("low adherence (<25%): no shame, just data framing", () => {
    const b = composeBriefing({
      ...base,
      day: 10,
      last7Possible: 7,
      last7Done: 1,
    });
    expect(b.toLowerCase()).toContain("a lapse isn't a collapse");
    expect(b.toLowerCase()).not.toContain("you got this");
    expect(b.toLowerCase()).not.toContain("come on");
  });

  it("final day: closes calmly", () => {
    const b = composeBriefing({
      ...base,
      day: 90,
      last7Possible: 7,
      last7Done: 5,
    });
    expect(b).toMatch(/final day/i);
  });
});
