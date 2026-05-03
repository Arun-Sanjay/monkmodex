/**
 * Safety gate checks — pure functions, no IO, no UI.
 *
 * Liability gates per CLAUDE.md. The UI layer renders the appropriate
 * interstitial; AI prompts read the same flags from scoring output.
 */

import type { QuizResponses } from "./schema";

export type SafetyGateKind =
  | "under_age"
  | "severe_aud"
  | "phq2_high"
  | "gad2_high"
  | "ed_history";

export interface SafetyGate {
  kind: SafetyGateKind;
  /** True when the user must STOP. False when we surface resources but allow continue. */
  hardBlock: boolean;
  /** Short headline shown in the interstitial. */
  title: string;
  /** Body text. */
  body: string;
  /** Optional list of resources to link. */
  resources?: { label: string; href: string }[];
}

export function isUnderAge(responses: QuizResponses): boolean {
  return responses.q1 === "under_18";
}

export function isSevereAud(responses: QuizResponses): boolean {
  return responses.q7 === "15_plus" && responses.q7_followup === "yes";
}

export function isEdHistory(responses: QuizResponses): boolean {
  return responses.ed_followup === "yes";
}

export function isPhq2High(responses: QuizResponses): boolean {
  return (responses.q19a ?? 0) + (responses.q19b ?? 0) >= 3;
}

export function isGad2High(responses: QuizResponses): boolean {
  return (responses.q20a ?? 0) + (responses.q20b ?? 0) >= 3;
}

/**
 * Should we trigger the AUD follow-up branch (Q7 = 15+/wk)?
 */
export function needsAudFollowup(responses: QuizResponses): boolean {
  return responses.q7 === "15_plus" && responses.q7_followup === undefined;
}

/**
 * Should we trigger the ED follow-up branch?
 * (Show if user listed junk_food in Q4 and we haven't asked yet.)
 */
export function needsEdFollowup(responses: QuizResponses): boolean {
  if (responses.ed_followup !== undefined) return false;
  return (responses.q4 ?? []).includes("junk_food");
}

/**
 * Build the gate config for the under-age hard block.
 */
export function underAgeGate(): SafetyGate {
  return {
    kind: "under_age",
    hardBlock: true,
    title: "Monk ModeX is for adults.",
    body: "This protocol asks adult-level commitment and screens for adult clinical conditions. We can't responsibly run that for someone under 18. Come back when you're 18 or older.",
  };
}

export function severeAudGate(): SafetyGate {
  return {
    kind: "severe_aud",
    hardBlock: true,
    title: "Talk to a clinician before reducing alcohol.",
    body: "Severe alcohol dependence with withdrawal symptoms can be medically dangerous to detox without supervision. Seizures and delirium tremens are real risks. Please speak with a doctor or addiction specialist before reducing intake — they can prescribe medications that make withdrawal safe.",
    resources: [
      {
        label: "SAMHSA National Helpline (US, free, confidential, 24/7)",
        href: "tel:1-800-662-4357",
      },
      {
        label: "Find a clinician near you (FindTreatment.gov)",
        href: "https://findtreatment.gov",
      },
    ],
  };
}

export function phq2HighGate(): SafetyGate {
  return {
    kind: "phq2_high",
    hardBlock: false,
    title: "A note before we continue.",
    body: "Your responses suggest persistent low mood that's worth talking to a clinician about. The protocol still works for you — sleep, sunlight, and movement have meaningful effects on depressive symptoms — but it pairs best with professional support. You can continue, or step away and come back.",
    resources: [
      {
        label: "Psychology Today therapist finder",
        href: "https://www.psychologytoday.com/us/therapists",
      },
    ],
  };
}

export function gad2HighGate(): SafetyGate {
  return {
    kind: "gad2_high",
    hardBlock: false,
    title: "A note before we continue.",
    body: "Your responses suggest elevated anxiety that's worth talking to a clinician about. The protocol still works for you — meditation and movement have meaningful effects on anxious symptoms — but it pairs best with professional support. You can continue, or step away and come back.",
    resources: [
      {
        label: "Psychology Today therapist finder",
        href: "https://www.psychologytoday.com/us/therapists",
      },
    ],
  };
}

export function edHistoryNote(): SafetyGate {
  return {
    kind: "ed_history",
    hardBlock: false,
    title: "Got it — we'll adjust the protocol.",
    body: "We won't recommend intermittent fasting, time-restricted eating, or calorie restriction in your protocol. Behavior change around food is more nuanced for people with disordered eating histories, and pairing this protocol with a clinician who knows your history is recommended.",
  };
}
