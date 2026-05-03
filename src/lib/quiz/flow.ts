/**
 * Quiz flow — pure step machine. Given the current question id and responses,
 * computes the next id (or "done" / a gate trigger).
 */

import type { QuizResponses } from "./schema";
import {
  isUnderAge,
  isSevereAud,
  isPhq2High,
  isGad2High,
  isEdHistory,
  needsAudFollowup,
  needsEdFollowup,
  type SafetyGate,
  underAgeGate,
  severeAudGate,
  phq2HighGate,
  gad2HighGate,
  edHistoryNote,
} from "./safety-gates";

export const FIRST_QUESTION = "q1";

export type FlowResult =
  | { kind: "next"; id: string }
  | { kind: "gate"; gate: SafetyGate; afterId: string | null }
  | { kind: "done" };

/**
 * Advance from `currentId` given the responses captured so far.
 * Returns the next thing to render: a question, a safety gate, or done.
 *
 * Gates with `hardBlock: true` halt the flow. Gates with `hardBlock: false`
 * are surfaced once and the caller advances past them via `nextAfterGate`.
 */
export function advance(
  currentId: string,
  responses: QuizResponses
): FlowResult {
  // Hard gates fire as soon as the answer is captured, before advancing.
  if (currentId === "q1" && isUnderAge(responses)) {
    return { kind: "gate", gate: underAgeGate(), afterId: null };
  }
  if (currentId === "q7_followup" && isSevereAud(responses)) {
    return { kind: "gate", gate: severeAudGate(), afterId: null };
  }

  // Soft gates fire alongside an advance; the gate UI offers "continue".
  if (currentId === "q19b" && isPhq2High(responses)) {
    return { kind: "gate", gate: phq2HighGate(), afterId: "q20a" };
  }
  if (currentId === "q20b" && isGad2High(responses)) {
    const next = needsEdFollowup(responses) ? "ed_followup" : "__done__";
    return { kind: "gate", gate: gad2HighGate(), afterId: next };
  }
  if (currentId === "ed_followup" && isEdHistory(responses)) {
    return { kind: "gate", gate: edHistoryNote(), afterId: "__done__" };
  }

  const next = nextId(currentId, responses);
  if (next === "__done__") return { kind: "done" };
  return { kind: "next", id: next };
}

/**
 * After the user dismisses a soft gate, jump to `afterId` (which may be
 * "__done__" to finish, or a question id).
 */
export function resumeAfterGate(afterId: string | null): FlowResult {
  if (afterId === null) return { kind: "done" }; // hard gate — no resume
  if (afterId === "__done__") return { kind: "done" };
  return { kind: "next", id: afterId };
}

function nextId(currentId: string, responses: QuizResponses): string {
  switch (currentId) {
    case "q1":
      return "q2";
    case "q2":
      return "q3";
    case "q3":
      return "q4";
    case "q4": {
      const cuts = responses.q4 ?? [];
      // If user picked "none" or selected nothing, skip Q5 and Q6.
      if (cuts.length === 0 || cuts.includes("none")) return "q7";
      return "q5";
    }
    case "q5":
      return "q6";
    case "q6":
      return "q7";
    case "q7":
      if (needsAudFollowup(responses)) return "q7_followup";
      return "q8";
    case "q7_followup":
      // If user reported withdrawal, the hard gate already fired in advance().
      return "q8";
    case "q8":
      return "q9";
    case "q9":
      return "q10";
    case "q10":
      return "q11";
    case "q11":
      return "q12";
    case "q12":
      return "q13";
    case "q13":
      return "q14";
    case "q14":
      return "q15";
    case "q15":
      return "q16";
    case "q16":
      return "q17";
    case "q17":
      return "q18";
    case "q18":
      return "q19a";
    case "q19a":
      return "q19b";
    case "q19b":
      return "q20a";
    case "q20a":
      return "q20b";
    case "q20b":
      if (needsEdFollowup(responses)) return "ed_followup";
      return "__done__";
    case "ed_followup":
      return "__done__";
    default:
      return "__done__";
  }
}

/**
 * Reverse navigation. The user can go back; for branched questions we walk
 * back to the most recently answered prior id.
 */
export function previousId(
  currentId: string,
  responses: QuizResponses
): string | null {
  const order: Record<string, string | null> = {
    q1: null,
    q2: "q1",
    q3: "q2",
    q4: "q3",
    q5: "q4",
    q6: "q5",
    q7: (responses.q4 ?? []).length === 0 || (responses.q4 ?? []).includes("none") ? "q4" : "q6",
    q7_followup: "q7",
    q8: needsAudFollowup(responses) || responses.q7 === "15_plus" ? "q7_followup" : "q7",
    q9: "q8",
    q10: "q9",
    q11: "q10",
    q12: "q11",
    q13: "q12",
    q14: "q13",
    q15: "q14",
    q16: "q15",
    q17: "q16",
    q18: "q17",
    q19a: "q18",
    q19b: "q19a",
    q20a: "q19b",
    q20b: "q20a",
    ed_followup: "q20b",
  };
  return order[currentId] ?? null;
}
