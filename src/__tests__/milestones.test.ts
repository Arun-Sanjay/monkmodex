import { describe, it, expect } from "vitest";
import { getMilestoneForDay, MILESTONE_DAYS } from "@/lib/milestones";

describe("milestones", () => {
  it("returns null for non-milestone days", () => {
    for (const d of [2, 3, 7, 13, 15, 29, 31, 89, 91]) {
      expect(getMilestoneForDay(d, "operator", 90)).toBeNull();
    }
  });

  it("returns Day 1 milestone with the right copy", () => {
    const m = getMilestoneForDay(1, "operator", 90);
    expect(m).not.toBeNull();
    expect(m!.day).toBe(1);
    expect(m!.title.toLowerCase()).toContain("worse before better");
  });

  it("returns Day 90 only for operator (90-day) tier", () => {
    expect(getMilestoneForDay(90, "operator", 90)).not.toBeNull();
    expect(getMilestoneForDay(90, "foundation", 30)).toBeNull();
  });

  it("Day 14 + Day 30 fire for both tiers", () => {
    expect(getMilestoneForDay(14, "foundation", 30)).not.toBeNull();
    expect(getMilestoneForDay(14, "operator", 90)).not.toBeNull();
    expect(getMilestoneForDay(30, "foundation", 30)).not.toBeNull();
    expect(getMilestoneForDay(30, "operator", 90)).not.toBeNull();
  });

  it("Foundation tier Day 30 reads as completion, Operator as Phase 1 close", () => {
    const f = getMilestoneForDay(30, "foundation", 30);
    const o = getMilestoneForDay(30, "operator", 90);
    expect(f!.title.toLowerCase()).toContain("you've finished");
    expect(o!.title.toLowerCase()).toContain("phase 1");
  });

  it("MILESTONE_DAYS list matches the function's behavior", () => {
    for (const d of MILESTONE_DAYS) {
      expect(getMilestoneForDay(d, "operator", 90)).not.toBeNull();
    }
  });
});
