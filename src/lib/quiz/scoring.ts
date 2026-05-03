/**
 * Quiz scoring — pure functions, no IO.
 *
 * Produces flags, primary/secondary cuts, substrate scores, and a
 * recommended duration that downstream prompts and UI consume.
 */

import type { QuizResponses } from "./schema";

export type SubstrateLevel = "critical" | "weak" | "okay" | "strong";

export interface ScoringFlags {
  phq2High: boolean;
  gad2High: boolean;
  severeAud: boolean;
  edHistory: boolean;
}

export interface ScoringOutput {
  primaryCut: string | null;
  secondaryCuts: string[];
  flags: ScoringFlags;
  substrate: {
    sleep: SubstrateLevel;
    sunlight: SubstrateLevel;
    movement: SubstrateLevel;
  };
  recommendedDuration: 30 | 60 | 90;
  phq2Score: number;
  gad2Score: number;
}

export function scoreQuiz(responses: QuizResponses): ScoringOutput {
  const primaryCut = responses.q5 ?? null;
  const secondaryCuts = (responses.q4 ?? [])
    .filter((c) => c !== primaryCut && c !== "none")
    .slice(0, 2);

  const phq2Score = (responses.q19a ?? 0) + (responses.q19b ?? 0);
  const gad2Score = (responses.q20a ?? 0) + (responses.q20b ?? 0);

  const flags: ScoringFlags = {
    phq2High: phq2Score >= 3,
    gad2High: gad2Score >= 3,
    severeAud: responses.q7 === "15_plus" && responses.q7_followup === "yes",
    edHistory: responses.ed_followup === "yes",
  };

  return {
    primaryCut,
    secondaryCuts,
    flags,
    substrate: {
      sleep: scoreSleep(responses.q8, responses.q9, responses.q10),
      sunlight: scoreSunlight(responses.q11),
      movement: scoreMovement(responses.q13),
    },
    recommendedDuration: recommendDuration(responses.q6),
    phq2Score,
    gad2Score,
  };
}

function scoreSleep(
  hours?: string,
  consistency?: string,
  phone?: string
): SubstrateLevel {
  if (hours === "under_5" || hours === "5_6") return "critical";
  if (consistency === "2_plus_hours") return "critical";
  if (phone === "on_nightstand") return "weak";
  if (
    (hours === "7_8" || hours === "8_9") &&
    (consistency === "under_30_min" || consistency === "30_60_min") &&
    phone === "another_room"
  )
    return "strong";
  if (hours === "6_7") return "okay";
  return "okay";
}

function scoreSunlight(answer?: string): SubstrateLevel {
  switch (answer) {
    case "daily":
      return "strong";
    case "few_days":
      return "okay";
    case "rarely":
      return "weak";
    case "never":
      return "critical";
    default:
      return "okay";
  }
}

function scoreMovement(answer?: string): SubstrateLevel {
  switch (answer) {
    case "daily":
    case "4_6_per_week":
      return "strong";
    case "1_3_per_week":
      return "okay";
    case "less_than_weekly":
      return "weak";
    case "none":
      return "critical";
    default:
      return "okay";
  }
}

function recommendDuration(durationOfPattern?: string): 30 | 60 | 90 {
  if (durationOfPattern === "5_plus_years") return 90;
  if (durationOfPattern === "2_5_years") return 60;
  return 30;
}
