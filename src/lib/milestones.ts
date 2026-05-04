/**
 * Day-N milestones surfaced as one-time interstitials on Today.
 * Calm, no celebration. Each is keyed by the day number; once seen,
 * never shown again for that protocol.
 */

import type { Tier } from "@/services/supabase/types";

export interface Milestone {
  day: number;
  kicker: string;
  title: string;
  body: string;
  cta: string;
}

export function getMilestoneForDay(
  day: number,
  tier: Tier,
  duration: 30 | 90
): Milestone | null {
  if (day === 1) {
    return {
      day: 1,
      kicker: "Day 01 — you've started",
      title: "The first 14 days will feel worse before better.",
      body: "Lembke calls this the pleasure-pain balance — the gremlins on the pain side rebalancing. It's the recovery, not the failure. Sleep first. Phone out of the room. Tick the easiest non-negotiable today, even if everything else slips.",
      cta: "Begin",
    };
  }
  if (day === 14) {
    return {
      day: 14,
      kicker: "Day 14 — substrate phase complete",
      title: "The floor is laid.",
      body: tier === "operator"
        ? "Two weeks of substrate work. From tomorrow, body reset adds on top — substrate keeps running. Body work compounds on the substrate, not in spite of it. If a workout breaks sleep, sleep wins."
        : "Two weeks of substrate work. From tomorrow, body reset adds on top — substrate keeps running. The cut should feel quieter than it did on day one.",
      cta: "Continue",
    };
  }
  if (day === 30) {
    return {
      day: 30,
      kicker: "Day 30 — foundation complete",
      title: tier === "foundation" ? "You've finished." : "Phase 1 closes here.",
      body: tier === "foundation"
        ? "Thirty days. The substrate that was a protocol is now a baseline you can keep running without ceremony. You can extend into Operator if the body and mind work calls — but the substrate is yours to keep, free, forever."
        : "First third complete. Mind reset begins on day 43. Between now and then, body reset deepens — keep the substrate running underneath everything.",
      cta: "Keep going",
    };
  }
  if (day === 90 && duration === 90) {
    return {
      day: 90,
      kicker: "Day 90 — protocol complete",
      title: "What you keep is what you keep.",
      body: "Ninety days. The version of you that started this would not recognize the version that finished it. From here, the dashboard becomes optional — substrate is automatic, the cut is held, and the choices that fill the day are yours to write.",
      cta: "Close the protocol",
    };
  }
  return null;
}

export const MILESTONE_DAYS = [1, 14, 30, 90] as const;
