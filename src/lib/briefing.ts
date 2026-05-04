/**
 * Compose the daily briefing — a 2-3 line server-rendered note on Today
 * that references the user's protocol position and recent adherence.
 *
 * Rule-based templating (not AI). Each dashboard load runs ~5μs of string
 * composition; no token cost. Tuned for the anti-supernormal voice — no
 * celebration, no streak-at-risk, no "you got this." Just the read.
 */

export interface BriefingInput {
  /** 1-indexed day in protocol */
  day: number;
  /** total protocol length, 30 or 90 */
  totalDays: number;
  /** number of NNs completed today */
  completedToday: number;
  /** total NNs in the protocol */
  totalNN: number;
  /** Days adhered (any check-in with at least 1 NN) in the last 7 in-protocol days */
  last7Done: number;
  /** Possible days (capped at 7 or day count, whichever is smaller) */
  last7Possible: number;
  /** "Substrate" | "Body Reset" | "Mind Reset" — the current phase */
  phaseLabel: string;
  /** Whether the user has already started today (>=1 logged) */
  todayStarted: boolean;
}

/**
 * Returns 1-2 sentences in the MMX voice. Designed to sit calmly above
 * the non-negotiables list as a brief context line.
 */
export function composeBriefing(input: BriefingInput): string {
  const {
    day,
    totalDays,
    completedToday,
    totalNN,
    last7Done,
    last7Possible,
    phaseLabel,
    todayStarted,
  } = input;

  const dayLabel = `Day ${day}`;

  // Day 1 — special case
  if (day === 1) {
    if (todayStarted) {
      return `${dayLabel}. You started. The first 14 days will feel worse before better — that's recalibration. Keep ticking what's left.`;
    }
    return `${dayLabel}. Begin with whichever non-negotiable is easiest. Days 1–14 will feel worse before better — that's the substrate work, not failure.`;
  }

  // Adherence phrasing (only when we have ≥3 days of history to talk about)
  let adherenceLine = "";
  if (last7Possible >= 3) {
    const pct = last7Done / last7Possible;
    if (pct >= 0.85) {
      adherenceLine = ` You've shown up ${last7Done} of the last ${last7Possible} days — that's the recalibration working.`;
    } else if (pct >= 0.55) {
      adherenceLine = ` You've shown up ${last7Done} of the last ${last7Possible} days. The substrate is forming, not collapsed.`;
    } else if (pct >= 0.25) {
      adherenceLine = ` You've shown up ${last7Done} of the last ${last7Possible} days. Today is one decision — what's the smallest thing you can clear in the next ten minutes?`;
    } else {
      adherenceLine = ` ${last7Done} of the last ${last7Possible} days have a check-in. A lapse isn't a collapse — log one item today and the streak doesn't matter.`;
    }
  }

  // Phase boundary nudges
  if (day === 14) {
    return `${dayLabel} — you're at the edge of the substrate phase.${adherenceLine} If the night sleep numbers are stabilising, this is what they look like.`;
  }
  if (day === 15) {
    return `${dayLabel}. Body reset begins today. Substrate continues; movement adds on top.${adherenceLine}`;
  }
  if (day === 42) {
    return `${dayLabel} — body reset week complete.${adherenceLine}`;
  }
  if (day === 43 && totalDays >= 60) {
    return `${dayLabel}. Mind reset begins. The substrate is automatic by now; this layer changes what fills the day.${adherenceLine}`;
  }
  if (day === totalDays) {
    return `${dayLabel} — final day.${adherenceLine} What you keep doing after today is the protocol becoming a baseline.`;
  }

  // Standard day
  const completionLine =
    todayStarted && completedToday === totalNN
      ? `Today's foundation is closed. The day still has hours.`
      : todayStarted
        ? `${completedToday} of ${totalNN} logged so far.`
        : `Nothing logged yet — the easiest one first.`;

  return `${dayLabel} of ${totalDays} · ${phaseLabel}.${adherenceLine} ${completionLine}`;
}
