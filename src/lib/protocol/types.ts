/**
 * Protocol shape — single source of truth.
 *
 * Defined as Zod schemas; TS types are inferred via z.infer<>. The same
 * schemas validate AI structured outputs before they hit Postgres.
 *
 * Pure module — no React, no DOM, no IO.
 */

import { z } from "zod";

/* ============================================
 * Cuts
 * ============================================ */
export const IfThenPlanSchema = z.object({
  trigger: z.string().describe("The high-risk situation, in user terms"),
  response: z.string().describe("Specific pre-decided action when the trigger fires"),
});

export const CutSchema = z.object({
  target: z.string().describe("What's being cut, in user-facing language"),
  abstinence_days: z.union([z.literal(30), z.literal(60), z.literal(90)]),
  self_binding: z
    .array(z.string())
    .describe(
      "2-3 self-binding strategies (physical / categorical / chronological separation from the stimulus, per Lembke)"
    ),
  if_then_plans: z
    .array(IfThenPlanSchema)
    .describe(
      "2-3 if-then plans for the user's specific high-risk moments (Gollwitzer)"
    ),
  rationale: z
    .string()
    .describe(
      "1-2 sentences on why this specific cut for this specific user, with a research citation if natural"
    ),
});

/* ============================================
 * Non-negotiables (daily anchors)
 * ============================================ */
export const NonNegotiableSchema = z.object({
  id: z
    .string()
    .describe(
      "kebab-case stable identifier, e.g. 'morning-sunlight'. Used as the key in checkins.completed_items."
    ),
  title: z.string().describe("Short user-facing title, e.g. '10 min morning sunlight'"),
  anchor: z
    .string()
    .describe(
      "An existing routine the user reported, used as the Fogg anchor"
    ),
  tiny_action: z
    .string()
    .describe(
      "The full Fogg pattern: 'After I [anchor], I will [tiny new habit]'"
    ),
  time_of_day: z.enum(["morning", "midday", "evening", "night"]),
  research_citation: z
    .string()
    .describe("Researcher and year, e.g. 'Walker 2017' or 'Gollwitzer 2006'"),
  rationale: z
    .string()
    .describe(
      "1-2 sentences on why this matters for this specific user given their substrate scores and primary cut"
    ),
});

/* ============================================
 * Week-by-week plan
 * ============================================ */
export const WeekPlanSchema = z.object({
  week_number: z.number().int().describe("1-indexed week number, starting at 1"),
  focus: z.string().describe("What this week is about, in user-facing language"),
  expectation: z
    .string()
    .describe(
      "What it feels like — managing user expectations honestly. Days 1-14 feel worse, weeks 3-4 things click, etc."
    ),
  additions: z
    .array(z.string())
    .optional()
    .describe(
      "Optional new things added this week. Use sparingly — sequence matters."
    ),
});

/* ============================================
 * Protocol notes
 * ============================================ */
export const ProtocolNotesSchema = z.object({
  expectations: z
    .string()
    .describe(
      "What to expect across the protocol: days 1-14 feel worse, weeks 3-4 things click, etc. 2-4 sentences."
    ),
  lapse_handling: z
    .string()
    .describe(
      "How to handle a missed day or lapse without spiraling (Marlatt's abstinence violation effect). 2-3 sentences."
    ),
  professional_support_recommended: z.boolean(),
  medical_referral_required: z.boolean(),
});

/* ============================================
 * Operator-tier phases (only for tier='operator')
 * ============================================ */
export const Phase3BodyResetSchema = z.object({
  weeks: z.array(WeekPlanSchema),
  exercise_prescription: z.object({
    cardio_min_per_week: z.number().int(),
    resistance_sessions_per_week: z.number().int(),
    programming_template: z
      .string()
      .describe(
        "Personalized to user's equipment access (full gym / minimal home / bodyweight)"
      ),
  }),
  cold_exposure: z
    .object({
      protocol: z.string(),
      frequency: z.string(),
      caveat: z.string().describe("Never within 4 hrs of strength training, etc."),
    })
    .nullable()
    .describe("Null if user prefers not, or substrate is too weak yet"),
  tre: z
    .object({
      schedule: z.string().describe("e.g. '14:10' or '16:8'"),
      days_per_week: z.number().int(),
      caveat: z.string(),
    })
    .nullable()
    .describe(
      "ALWAYS null if flagged_ed_history. Never recommend TRE for users with disordered eating history."
    ),
});

export const Phase4MindResetSchema = z.object({
  weeks: z.array(WeekPlanSchema),
  meditation: z.object({
    duration_min: z.number().int(),
    sessions_per_day: z.number().int(),
    style: z.string().describe("e.g. 'FA breath' (focused-attention breath)"),
  }),
  journaling: z.object({
    frequency: z.string(),
    format: z.string(),
  }),
  reading: z.object({
    duration_min: z.number().int(),
    medium_preference: z.string().describe("e.g. 'print or e-ink'"),
  }),
  deep_work: z.object({
    blocks_per_day: z.number().int(),
    block_duration_min: z.number().int(),
  }),
});

/* ============================================
 * Top-level protocol schema
 * ============================================ */
export const ProtocolSchema = z.object({
  cuts: z.array(CutSchema).describe(
    "1-3 cuts maximum. Lembke's 'one drug of choice at a time' principle outperforms all-out asceticism."
  ),
  non_negotiables: z.array(NonNegotiableSchema).describe(
    "2-4 daily non-negotiables maximum. More dilutes formation per Wood & Neal."
  ),
  weeks: z.array(WeekPlanSchema).describe(
    "Week-by-week plan. 4 weeks for foundation, 8-13 for operator (handled in phase_3 + phase_4)."
  ),
  protocol_notes: ProtocolNotesSchema,
  phase_3_body_reset: Phase3BodyResetSchema.nullable().describe(
    "Null for foundation tier. Required for operator tier."
  ),
  phase_4_mind_reset: Phase4MindResetSchema.nullable().describe(
    "Null for foundation tier. Required for operator tier."
  ),
});

/* ============================================
 * Inferred types (consumed by UI + queries)
 * ============================================ */
export type IfThenPlan = z.infer<typeof IfThenPlanSchema>;
export type Cut = z.infer<typeof CutSchema>;
export type NonNegotiable = z.infer<typeof NonNegotiableSchema>;
export type WeekPlan = z.infer<typeof WeekPlanSchema>;
export type ProtocolNotes = z.infer<typeof ProtocolNotesSchema>;
export type Phase3BodyReset = z.infer<typeof Phase3BodyResetSchema>;
export type Phase4MindReset = z.infer<typeof Phase4MindResetSchema>;
export type Protocol = z.infer<typeof ProtocolSchema>;
