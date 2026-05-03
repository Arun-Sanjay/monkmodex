/**
 * Diagnosis prompt builder.
 *
 * Builds a per-user "user message" given quiz responses + scoring output.
 * The system prompt is shared (cached) — keep volatile content here in the
 * user turn so the prefix stays stable across requests.
 *
 * Returns a structured JSON object (prose + headline + pull_quotes +
 * citations) so the UI can render dramatic typography around the strongest
 * sentences and surface footnoted research.
 */

import type { QuizResponses } from "@/lib/quiz/schema";
import type { ScoringOutput } from "@/lib/quiz/scoring";
import { getCutLabel } from "@/lib/quiz/schema";

export function buildDiagnosisUserMessage(
  responses: QuizResponses,
  scoring: ScoringOutput
): string {
  const flagsList: string[] = [];
  if (scoring.flags.phq2High)
    flagsList.push(`flagged_phq2_high (PHQ-2 score: ${scoring.phq2Score})`);
  if (scoring.flags.gad2High)
    flagsList.push(`flagged_gad2_high (GAD-2 score: ${scoring.gad2Score})`);
  if (scoring.flags.severeAud) flagsList.push("flagged_severe_aud");
  if (scoring.flags.edHistory) flagsList.push("flagged_ed_history");

  const cutsLine = scoring.primaryCut
    ? `${getCutLabel(scoring.primaryCut)}${
        scoring.secondaryCuts.length
          ? `; secondary: ${scoring.secondaryCuts.map(getCutLabel).join(", ")}`
          : ""
      }`
    : "none specified";

  return `Generate a personalized "Reward System Diagnosis" for this user as a single JSON object. No prose before or after, no markdown code fences. Just the JSON object.

# OUTPUT — JSON SHAPE

\`\`\`
{
  "headline": string,                  // ONE sentence — the single most important read on this user. Tattoo-on-the-brain quality. e.g., "Sleep is your dominant variable, not the porn."
  "prose": string,                     // 350–550 words, 3–5 paragraphs. See structure below. Citation markers as [1], [2] etc. — match \`citations\` array.
  "pull_quotes": string[],             // 2–3 strongest sentences. Verbatim from prose. Each <= 18 words. These get NYT-style large-serif treatment.
  "citations": [
    {
      "id": number,                    // 1, 2, 3 — referenced inline in prose as [N]
      "author": string,                // "Volkow et al." or "Walker"
      "year": number,                  // 2017
      "title": string,                 // "Neurobiological basis of compulsive sexual behavior"
      "journal": string | null,        // "J. Sex Med" or "Nature Reviews Neuroscience" — null if book
      "finding": string | null         // 1 sentence on what the cited work shows. Shown in hover tooltip.
    }
    // 4–8 citations total
  ]
}
\`\`\`

# PROSE STRUCTURE (write as flowing prose — do not label these)

Aim for 350–550 words across 3–5 paragraphs. Be specific, clinical, respectful of intelligence.

1. **Open** with what's specifically dysregulated in their reward system, citing their primary cut, substrate weaknesses, and self-assessment. Be concrete: name THEIR pattern (sleep duration, phone-on-nightstand, "cooked" self-assessment, etc.) — not a generic dopamine speech.
2. **Mechanism** — explain HOW their pattern produces what they're feeling. Cite specific research with [N] markers. Cover at least:
   - The reward-system mechanism (D2 downregulation if applicable — Volkow's imaging work, or sleep-mediated impulse control suppression — Walker, or substrate deficits + low tonic dopamine).
   - The compounding mechanism (e.g., why poor sleep AMPLIFIES the cut's grip — sleep deprivation suppresses tonic dopamine and prefrontal control the next day).
3. **Sequence** — name the clinical principle (Lembke's substrate-before-behavior, or Marlatt's abstinence-violation effect for lapse handling) and tell them what the protocol targets first and why. Be honest that hitting the cut directly without substrate would be fighting biology with willpower.
4. **Honesty closer** — one paragraph acknowledging that days 1–14 typically feel worse before they feel better. Frame as the gremlins on the pain side rebalancing — that's recovery, not failure. End with one short, quotable line.

# WRITING RULES

- Pure prose. No bullets. No headers. No numbered lists in the output.
- Cite specific research papers with [N] markers, e.g., "the same D2 receptor downregulation pattern Volkow's PET imaging work documents [1]". The [N] must match a citations entry.
- DO NOT use generic "studies show" or "research suggests." Always anchor to a specific researcher.
- Pull-quotes must be 2–3 of the strongest sentences from the prose, copied verbatim, each <= 18 words.
- Use second person ("you", "your"). Never address by name. No greeting.
- Tone: clinical-grade, direct, unsentimental. NOT motivational. NOT shaming.

# CITATION GUIDANCE — DRAW FROM THIS RESEARCH POOL

(Pick the ones that fit this user's pattern. Use real titles and journals.)

- Volkow et al. — "Imaging the addicted human brain" / "Neurobiological basis of compulsive sexual behavior" (Journal of Sex Medicine, Translational Psychiatry, etc.). For D2 downregulation in CSB and other reward-system disorders.
- Walker M. — "Why We Sleep" (Scribner 2017). For sleep duration / consolidation / next-day prefrontal effects.
- Czeisler / AASM — for circadian and wake-time consistency.
- Hattar — for morning light retinal-circadian work.
- Lembke A. — "Dopamine Nation" (Dutton 2021). For substrate-before-behavior, supernormal stimuli, and the pleasure-pain balance gremlin model.
- Marlatt — "Relapse Prevention" (Guilford 1985, updated 2005). For abstinence violation effect and lapse handling.
- Gollwitzer — "Implementation intentions" (American Psychologist 1999, meta-analysis 2006). For if-then plans (d=0.65).
- Lally et al. — "How are habits formed: Modeling habit formation in the real world" (European Journal of Social Psychology 2010). For median-66-day habit formation.
- Berridge — "Wanting versus liking" (Annual Review of Psychology). For incentive salience vs hedonic capacity.
- Fogg BJ — "Tiny Habits" (Houghton Mifflin Harcourt 2020). For anchor-based behavior design.
- Beauchaine / heart-rate-variability research for emotion regulation.

${
  scoring.flags.phq2High || scoring.flags.gad2High
    ? `# IMPORTANT — MENTAL HEALTH FLAG\n\nThis user's mental-health screen is elevated. In the prose, briefly acknowledge (1 sentence near the end) that the protocol pairs best with professional support — recommend they consider speaking with a clinician. Don't be alarmist or dwell.\n\n`
    : ""
}${
    scoring.flags.severeAud
      ? `# IMPORTANT — SEVERE AUD FLAG\n\nThis user's alcohol use suggests severe AUD. DO NOT recommend abstinence as a cut. Instead, recommend medical evaluation before any reduction. The diagnosis must include a clear sentence about medical supervision being the right next step for alcohol specifically.\n\n`
      : ""
  }${
    scoring.flags.edHistory
      ? `# IMPORTANT — ED HISTORY FLAG\n\nThis user has a disordered-eating history. Avoid food-quantity language entirely. If junk food / sugar is on their cut list, frame as quality and stimulus reduction, not restriction.\n\n`
      : ""
  }# USER QUIZ DATA

- Age: ${responses.q1 ?? "—"}
- Life situation: ${responses.q2 ?? "—"}
- Self-assessment: ${responses.q3 ?? "—"}
- Primary cut: ${cutsLine}
- Pattern duration: ${responses.q6 ?? "n/a"}
- Sleep: ${responses.q8 ?? "—"}; consistency: ${responses.q9 ?? "—"}; phone in bedroom: ${responses.q10 ?? "—"}
- Morning sunlight: ${responses.q11 ?? "—"}
- Caffeine timing: ${responses.q12 ?? "—"}
- Exercise: ${responses.q13 ?? "—"}
- Wake time: ${responses.q14 ?? "—"}
- Existing routines (anchors): ${
    (responses.q15 ?? []).length ? (responses.q15 ?? []).join(", ") : "none reported"
  }
- Equipment: ${responses.q16 ?? "—"}
- Time available per day: ${responses.q17 ?? "—"}
- Identity statement: ${
    responses.q18
      ? `"${responses.q18}"`
      : "(not provided — speak about who they're becoming generically)"
  }

# SUBSTRATE SCORES

- Sleep: ${scoring.substrate.sleep}
- Sunlight: ${scoring.substrate.sunlight}
- Movement: ${scoring.substrate.movement}

# FLAGS

${flagsList.length ? flagsList.map((f) => `- ${f}`).join("\n") : "- (none)"}

Output the JSON object now. Start with \`{\` and end with \`}\`. No other text.`;
}
