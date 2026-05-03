/**
 * Protocol prompt builder — Foundation (30d) and Operator (90d) tiers.
 *
 * Builds the user-turn message. The system prompt is shared and cached.
 */

import type { QuizResponses } from "@/lib/quiz/schema";
import type { ScoringOutput } from "@/lib/quiz/scoring";
import { getCutLabel } from "@/lib/quiz/schema";
import type { Tier } from "@/lib/constants";

export function buildProtocolUserMessage(input: {
  responses: QuizResponses;
  scoring: ScoringOutput;
  diagnosis: string;
  tier: Tier;
}): string {
  const { responses, scoring, diagnosis, tier } = input;

  const flagsList: string[] = [];
  if (scoring.flags.phq2High) flagsList.push("flagged_phq2_high");
  if (scoring.flags.gad2High) flagsList.push("flagged_gad2_high");
  if (scoring.flags.severeAud) flagsList.push("flagged_severe_aud");
  if (scoring.flags.edHistory) flagsList.push("flagged_ed_history");

  const anchors = (responses.q15 ?? []).filter((r) => r !== "no_routines");
  const anchorsLine = anchors.length
    ? anchors.join(", ")
    : "(NONE — user reported no consistent routines. First non-negotiable should be 'fixed wake time' as the foundational anchor that everything else hangs from.)";

  const cutsLine = scoring.primaryCut
    ? `${getCutLabel(scoring.primaryCut)}${
        scoring.secondaryCuts.length
          ? `; secondary candidates: ${scoring.secondaryCuts.map(getCutLabel).join(", ")}`
          : ""
      }`
    : "no specific compulsion — focus protocol on substrate work";

  const tierInstructions =
    tier === "foundation"
      ? `# TIER: FOUNDATION (30 DAYS, PHASES 1-2)

- Generate 4 weeks in \`weeks\` (week_number 1 through 4).
- Set \`phase_3_body_reset\` and \`phase_4_mind_reset\` to **null**.
`
      : `# TIER: OPERATOR (90 DAYS, PHASES 1-4)

- Generate 4 weeks in \`weeks\` (week_number 1 through 4) for the Foundation phase.
- Generate \`phase_3_body_reset\` covering weeks 3-6 (overlaps with Foundation by design — Body Reset starts before Foundation finishes).
- Generate \`phase_4_mind_reset\` covering weeks 5-8.
- Both phase_3 and phase_4 must include their \`weeks\` arrays with week_number in the appropriate range.
`;

  return `Generate this user's personalized ${tier === "foundation" ? "30-day Foundation" : "90-day Operator"} Protocol as a single JSON object — no prose before or after, no markdown code fences, no explanation. Just the JSON object.

# JSON SHAPE (every field required unless marked optional/nullable)

\`\`\`
{
  "cuts": [
    {
      "target": string,
      "abstinence_days": 30 | 60 | 90,
      "self_binding": [string, ...],          // 2-3 items
      "if_then_plans": [                       // 2-3 items
        { "trigger": string, "response": string }
      ],
      "rationale": string
    }
    // 1-3 cuts total
  ],
  "non_negotiables": [
    {
      "id": string,                            // kebab-case
      "title": string,
      "anchor": string,
      "tiny_action": string,                   // "After I X, I will Y"
      "time_of_day": "morning" | "midday" | "evening" | "night",
      "research_citation": string,
      "rationale": string
    }
    // 2-4 items total
  ],
  "weeks": [
    {
      "week_number": number,                   // 1-indexed integer
      "focus": string,
      "expectation": string,
      "additions": [string, ...] | undefined   // optional
    }
  ],
  "protocol_notes": {
    "expectations": string,
    "lapse_handling": string,
    "professional_support_recommended": boolean,
    "medical_referral_required": boolean
  },
  "phase_3_body_reset": null | {
    "weeks": [WeekPlan, ...],
    "exercise_prescription": {
      "cardio_min_per_week": integer,
      "resistance_sessions_per_week": integer,
      "programming_template": string
    },
    "cold_exposure": null | { "protocol": string, "frequency": string, "caveat": string },
    "tre": null | { "schedule": string, "days_per_week": integer, "caveat": string }
  },
  "phase_4_mind_reset": null | {
    "weeks": [WeekPlan, ...],
    "meditation": { "duration_min": integer, "sessions_per_day": integer, "style": string },
    "journaling": { "frequency": string, "format": string },
    "reading": { "duration_min": integer, "medium_preference": string },
    "deep_work": { "blocks_per_day": integer, "block_duration_min": integer }
  }
}
\`\`\`

This protocol is for the user whose diagnosis you wrote earlier:

"""
${diagnosis}
"""

${tierInstructions}

# CONSTRAINTS

## Cuts
- 1-3 cuts maximum. Lembke's "one drug of choice at a time" beats all-out asceticism.
- Primary cut from quiz is required: ${cutsLine}.
- Each cut needs:
  - \`target\`: user-facing description (e.g. "Pornography", "Short-form video")
  - \`abstinence_days\`: ${scoring.recommendedDuration} (this is what scoring recommends — adjust only if you have a strong reason)
  - \`self_binding\`: 2-3 strategies covering physical / categorical / chronological separation from the stimulus
  - \`if_then_plans\`: 2-3 plans for THIS user's specific high-risk situations (consider their life situation, work, schedule)
  - \`rationale\`: 1-2 sentences on why this cut for this user

## Non-negotiables (2-4 max)
- Each MUST anchor to one of the user's existing routines (Fogg pattern):
  - User's reported routines: ${anchorsLine}
- Substrate priorities given the user's scores:
  - Sleep substrate: ${scoring.substrate.sleep} ${scoring.substrate.sleep === "critical" || scoring.substrate.sleep === "weak" ? "→ sleep MUST be a non-negotiable" : ""}
  - Sunlight substrate: ${scoring.substrate.sunlight} ${scoring.substrate.sunlight === "critical" || scoring.substrate.sunlight === "weak" ? "→ morning sunlight MUST be a non-negotiable" : ""}
  - Movement substrate: ${scoring.substrate.movement} ${scoring.substrate.movement === "critical" ? "→ start tiny: 7K steps or 10 min walk. NOT a heavy training plan." : ""}
- Each non-negotiable needs:
  - \`id\`: kebab-case stable id (e.g. 'morning-sunlight')
  - \`title\`: short noun-phrase action only — see Title rules below
  - \`anchor\`: which existing routine this hooks to. Use natural English, lowercase, with spaces (NOT snake_case). Good: "morning coffee", "evening wind-down", "getting into bed". Bad: "morning_coffee", "evening_wind_down".
  - \`tiny_action\`: full Fogg phrasing — "After I [anchor], I will [tiny new habit]"
  - \`time_of_day\`: morning / midday / evening / night
  - \`research_citation\`: e.g. "Walker 2017" or "Gollwitzer 2006"
  - \`rationale\`: 1-2 sentences specific to THIS user

### Title rules (strict — these will be sanitized post-generation if violated)

Every non-negotiable is daily by definition. The UI handles frequency. **Titles must never include frequency or always-clauses.**

Forbidden phrases inside \`title\` (case-insensitive):
- "daily", "every day", "every single day", "each day"
- "X days a week" (any number), "X / week"
- "always", "consistently", "without fail"
- "every morning/evening/night" (the time-of-day field captures this — don't repeat it in title)

Forbidden trailing patterns (anything after the last useful word that's just frequency padding):
- ", 7 days a week" / ", every day" / ", daily" / ", always"

Good titles (concise, action-first, no frequency):
- "Fixed wake time before 6am"
- "10 min morning sunlight"
- "Phone outside the bedroom"
- "20 min print reading before sleep"
- "8K steps"

Bad titles (DO NOT generate):
- "Fixed wake time before 6am, 7 days a week" → strip the suffix
- "Daily 10 min sunlight" → drop "Daily"
- "Phone outside bedroom every night" → drop "every night"
- "Always read before sleep" → drop "Always"

If a frequency would be useful, put it in \`rationale\` instead of \`title\`.

## Weeks
- For Foundation: 4 weeks, each with focus + honest expectation (days 1-14 worse, weeks 3-4 things click).
- For Operator: 4 Foundation weeks PLUS phase_3.weeks + phase_4.weeks.

## Protocol notes
- \`expectations\`: 2-4 sentences on what to expect across the protocol.
- \`lapse_handling\`: 2-3 sentences on handling missed days without spiraling. Reference Marlatt's abstinence violation effect.
- \`professional_support_recommended\`: ${scoring.flags.phq2High || scoring.flags.gad2High ? "true (mental health flag set)" : "use your judgment based on flags"}.
- \`medical_referral_required\`: ${scoring.flags.severeAud ? "true (severe AUD flag set)" : "false"}.

# FLAG-BASED ADJUSTMENTS

${
  scoring.flags.severeAud
    ? "**flagged_severe_aud**: DO NOT include alcohol abstinence as a cut. If alcohol was the primary cut, replace it with substrate work and explicitly note in protocol_notes that alcohol reduction requires medical supervision.\n\n"
    : ""
}${
    scoring.flags.edHistory
      ? "**flagged_ed_history**: DO NOT include any TRE / fasting / calorie-restriction recommendations. If junk-food was a cut, frame as quality and stimulus reduction (not quantity). For Operator, set \`phase_3_body_reset.tre\` to null.\n\n"
      : ""
  }${
    scoring.flags.phq2High || scoring.flags.gad2High
      ? "**Mental health flag**: emphasize movement and sleep first. Defer cold exposure to user discretion. Set \`professional_support_recommended: true\`.\n\n"
      : ""
  }# USER QUIZ DATA (recap)

- Age: ${responses.q1 ?? "—"} · life: ${responses.q2 ?? "—"} · self-assessment: ${responses.q3 ?? "—"}
- Sleep: ${responses.q8 ?? "—"} hrs, consistency ${responses.q9 ?? "—"}, phone ${responses.q10 ?? "—"}
- Sunlight: ${responses.q11 ?? "—"} · caffeine: ${responses.q12 ?? "—"} · exercise: ${responses.q13 ?? "—"}
- Wake time: ${responses.q14 ?? "—"} · equipment: ${responses.q16 ?? "—"} · time/day: ${responses.q17 ?? "—"}
- Identity: ${
    responses.q18 ? `"${responses.q18}"` : "(none — speak generically about who they're becoming)"
  }
- Flags: ${flagsList.length ? flagsList.join(", ") : "(none)"}

Output the JSON object now. Start with \`{\` and end with \`}\`. No other text.`;
}
