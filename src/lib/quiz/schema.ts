/**
 * Quiz schema — pure types and metadata. No React, no DOM.
 *
 * 20 questions across 5 sections per mmx.md §7.
 * Question IDs are stable (q1, q4, q19a, etc.) and used by scoring.ts.
 */

export type QuestionType = "single" | "multi" | "text";

export interface QuestionOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface BaseQuestion {
  id: string;
  type: QuestionType;
  section: 1 | 2 | 3 | 4 | 5;
  question: string;
  helper?: string;
}

export interface SingleSelectQuestion extends BaseQuestion {
  type: "single";
  options: QuestionOption[];
}

export interface MultiSelectQuestion extends BaseQuestion {
  type: "multi";
  options: QuestionOption[];
  noneValue?: string;
}

export interface TextQuestion extends BaseQuestion {
  type: "text";
  placeholder?: string;
  examples?: string[];
  maxLength: number;
}

export type Question =
  | SingleSelectQuestion
  | MultiSelectQuestion
  | TextQuestion;

export const SECTION_NAMES: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "Where you are",
  2: "Your stimuli",
  3: "Your substrate",
  4: "Your context",
  5: "Direction & screening",
};

/* ============================================
 * Cut targets — used in Q4 (multi) and Q5 (single from Q4 answers)
 * ============================================ */
export const CUTS: QuestionOption[] = [
  { value: "porn", label: "Pornography", sublabel: "Any frequency that feels compulsive" },
  { value: "short_form_video", label: "Short-form video", sublabel: "TikTok, Reels, Shorts" },
  { value: "doomscroll", label: "Doomscrolling news / Twitter / Reddit" },
  { value: "video_games", label: "Video games", sublabel: "Especially mobile / gacha" },
  { value: "junk_food", label: "Junk food / sugar", sublabel: "Binge patterns" },
  { value: "vape", label: "Vape / nicotine" },
  { value: "cannabis", label: "Cannabis", sublabel: "Non-medical, regular use" },
  { value: "alcohol", label: "Alcohol", sublabel: "4+ drinks/week or binge patterns" },
  { value: "online_shopping", label: "Online shopping" },
  { value: "dating_apps", label: "Dating apps", sublabel: "Compulsive checking" },
];

/* ============================================
 * The 20 questions
 * ============================================ */
export const QUESTIONS: Question[] = [
  // Section 1 — Where you are
  {
    id: "q1",
    type: "single",
    section: 1,
    question: "Your age range.",
    options: [
      { value: "under_18", label: "Under 18" },
      { value: "18_24", label: "18–24" },
      { value: "25_29", label: "25–29" },
      { value: "30_34", label: "30–34" },
      { value: "35_plus", label: "35+" },
    ],
  },
  {
    id: "q2",
    type: "single",
    section: 1,
    question: "Your current life situation.",
    helper: "Choose what fits most.",
    options: [
      { value: "student", label: "Student" },
      { value: "working_full_time", label: "Working full-time" },
      { value: "self_employed", label: "Self-employed / running a business" },
      { value: "between_things", label: "Between things / unsure" },
      { value: "other", label: "Other" },
    ],
  },
  {
    id: "q3",
    type: "single",
    section: 1,
    question: "Honest self-assessment.",
    options: [
      {
        value: "cooked",
        label: "I'm cooked.",
        sublabel: "Most days feel like they slip away.",
      },
      {
        value: "inconsistent",
        label: "I'm inconsistent.",
        sublabel: "Good streaks, then I crash.",
      },
      {
        value: "functional",
        label: "I'm functional but want more depth.",
        sublabel: "Want more output.",
      },
      {
        value: "consistent",
        label: "I'm consistent — looking to optimize.",
      },
    ],
  },

  // Section 2 — Your stimuli (Hijack Index)
  {
    id: "q4",
    type: "multi",
    section: 2,
    question: "Which of these do you compulsively consume?",
    helper: "Select all that apply. Compulsive means you reach for it on autopilot.",
    options: [
      ...CUTS,
      { value: "none", label: "None of these" },
    ],
    noneValue: "none",
  },
  {
    id: "q5",
    type: "single",
    section: 2,
    question: "Of those, which feels most out of control?",
    helper: "This becomes your primary cut.",
    options: CUTS,
  },
  {
    id: "q6",
    type: "single",
    section: 2,
    question: "How long has this been a pattern?",
    options: [
      { value: "lt_6_months", label: "Less than 6 months" },
      { value: "6mo_2yr", label: "6 months – 2 years" },
      { value: "2_5_years", label: "2–5 years" },
      { value: "5_plus_years", label: "5+ years" },
    ],
  },
  {
    id: "q7",
    type: "single",
    section: 2,
    question: "Do you currently drink alcohol?",
    helper: "Roughly how much per week?",
    options: [
      { value: "none", label: "I don't drink" },
      { value: "1_3", label: "1–3 drinks/week" },
      { value: "4_7", label: "4–7 drinks/week" },
      { value: "8_14", label: "8–14 drinks/week" },
      { value: "15_plus", label: "15+ drinks/week" },
    ],
  },

  // Section 3 — Your substrate
  {
    id: "q8",
    type: "single",
    section: 3,
    question: "Average sleep over the last 2 weeks.",
    options: [
      { value: "under_5", label: "Under 5 hours" },
      { value: "5_6", label: "5–6 hours" },
      { value: "6_7", label: "6–7 hours" },
      { value: "7_8", label: "7–8 hours" },
      { value: "8_9", label: "8–9 hours" },
      { value: "9_plus", label: "9+ hours" },
    ],
  },
  {
    id: "q9",
    type: "single",
    section: 3,
    question: "Sleep consistency — how much does your bedtime vary?",
    helper: "Across a typical week.",
    options: [
      { value: "under_30_min", label: "Less than 30 min variance" },
      { value: "30_60_min", label: "30–60 min variance" },
      { value: "1_2_hours", label: "1–2 hour variance" },
      { value: "2_plus_hours", label: "2+ hour variance (irregular)" },
    ],
  },
  {
    id: "q10",
    type: "single",
    section: 3,
    question: "Phone in your bedroom while you sleep?",
    options: [
      { value: "on_nightstand", label: "Yes, on nightstand" },
      { value: "another_corner", label: "Yes, but in another corner" },
      { value: "another_room", label: "No, in another room" },
    ],
  },
  {
    id: "q11",
    type: "single",
    section: 3,
    question: "Morning sunlight in the first 60 min of waking?",
    options: [
      { value: "daily", label: "Daily" },
      { value: "few_days", label: "A few days a week" },
      { value: "rarely", label: "Rarely" },
      { value: "never", label: "Never (mostly indoors / dark)" },
    ],
  },
  {
    id: "q12",
    type: "single",
    section: 3,
    question: "Caffeine — when's your last cup of the day?",
    options: [
      { value: "none", label: "I don't have caffeine" },
      { value: "before_noon", label: "Before noon" },
      { value: "noon_4pm", label: "Noon – 4 PM" },
      { value: "after_4pm", label: "After 4 PM" },
    ],
  },
  {
    id: "q13",
    type: "single",
    section: 3,
    question: "Exercise — how often, last 2 weeks?",
    options: [
      { value: "daily", label: "Daily" },
      { value: "4_6_per_week", label: "4–6×/week" },
      { value: "1_3_per_week", label: "1–3×/week" },
      { value: "less_than_weekly", label: "Less than weekly" },
      { value: "none", label: "None" },
    ],
  },

  // Section 4 — Your context
  {
    id: "q14",
    type: "single",
    section: 4,
    question: "What time do you typically wake up on weekdays?",
    options: [
      { value: "before_6", label: "Before 6 AM" },
      { value: "6_7", label: "6–7 AM" },
      { value: "7_8", label: "7–8 AM" },
      { value: "8_9", label: "8–9 AM" },
      { value: "9_10", label: "9–10 AM" },
      { value: "after_10", label: "After 10 AM" },
    ],
  },
  {
    id: "q15",
    type: "multi",
    section: 4,
    question: "Reliable existing routines.",
    helper:
      "Select all that apply. These become anchors for new habits — Fogg's pattern is 'after I [routine], I will [tiny new habit]'.",
    options: [
      { value: "morning_coffee", label: "Morning coffee" },
      { value: "morning_shower", label: "Morning shower" },
      { value: "brushing_teeth", label: "Brushing teeth (morning or night)" },
      { value: "commute", label: "Commute (drive / walk / transit)" },
      { value: "lunch_break", label: "Lunch break at consistent time" },
      { value: "dinner", label: "Dinner at consistent time" },
      { value: "pre_bed", label: "Pre-bed routine" },
      { value: "no_routines", label: "I don't really have consistent routines" },
    ],
    noneValue: "no_routines",
  },
  {
    id: "q16",
    type: "single",
    section: 4,
    question: "Equipment access for exercise.",
    options: [
      { value: "full_gym", label: "Full gym membership" },
      { value: "home_gym", label: "Home gym (real equipment)" },
      { value: "minimal_home", label: "Minimal home equipment", sublabel: "Dumbbells, bands" },
      { value: "bodyweight", label: "Bodyweight only" },
      { value: "none_outdoor", label: "None / outdoor only" },
    ],
  },
  {
    id: "q17",
    type: "single",
    section: 4,
    question: "How much time can you commit to this protocol per day?",
    options: [
      { value: "15_30_min", label: "15–30 min" },
      { value: "30_60_min", label: "30–60 min" },
      { value: "1_2_hours", label: "1–2 hours" },
      { value: "2_plus_hours", label: "2+ hours" },
    ],
  },

  // Section 5 — Direction & screening
  {
    id: "q18",
    type: "text",
    section: 5,
    question: "I am becoming a person who…",
    helper: "Be specific. This anchors everything.",
    placeholder: "…",
    examples: [
      "…ships work daily and reads instead of scrolls",
      "…trains hard, eats clean, and goes to bed early",
      "…builds a business while finishing my degree",
    ],
    maxLength: 200,
  },
  {
    id: "q19a",
    type: "single",
    section: 5,
    question: "Little interest or pleasure in doing things?",
    helper:
      "Over the last 2 weeks. Not a diagnostic tool — if you're struggling, please consider professional support.",
    options: [
      { value: "0", label: "Not at all" },
      { value: "1", label: "Several days" },
      { value: "2", label: "More than half the days" },
      { value: "3", label: "Nearly every day" },
    ],
  },
  {
    id: "q19b",
    type: "single",
    section: 5,
    question: "Feeling down, depressed, or hopeless?",
    helper: "Over the last 2 weeks.",
    options: [
      { value: "0", label: "Not at all" },
      { value: "1", label: "Several days" },
      { value: "2", label: "More than half the days" },
      { value: "3", label: "Nearly every day" },
    ],
  },
  {
    id: "q20a",
    type: "single",
    section: 5,
    question: "Feeling nervous, anxious, or on edge?",
    helper: "Over the last 2 weeks.",
    options: [
      { value: "0", label: "Not at all" },
      { value: "1", label: "Several days" },
      { value: "2", label: "More than half the days" },
      { value: "3", label: "Nearly every day" },
    ],
  },
  {
    id: "q20b",
    type: "single",
    section: 5,
    question: "Not being able to stop or control worrying?",
    helper: "Over the last 2 weeks.",
    options: [
      { value: "0", label: "Not at all" },
      { value: "1", label: "Several days" },
      { value: "2", label: "More than half the days" },
      { value: "3", label: "Nearly every day" },
    ],
  },
];

/* ============================================
 * Follow-up questions — branched, not in main flow
 * ============================================ */
export const Q7_AUD_FOLLOWUP: SingleSelectQuestion = {
  id: "q7_followup",
  type: "single",
  section: 2,
  question: "Have you ever tried to cut back and experienced withdrawal symptoms?",
  helper:
    "Examples: shakes, nausea, sweating, anxiety, sleep disruption when not drinking.",
  options: [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ],
};

export const ED_FOLLOWUP: SingleSelectQuestion = {
  id: "ed_followup",
  type: "single",
  section: 5,
  question: "Have you ever struggled with disordered eating?",
  helper: "We ask because some recommendations (intermittent fasting, calorie restriction) are not appropriate if so.",
  options: [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ],
};

/* ============================================
 * Response shape — what scoring + AI prompts read.
 * All fields optional; partial responses are valid mid-quiz.
 * ============================================ */
export interface QuizResponses {
  q1?: string;
  q2?: string;
  q3?: string;
  q4?: string[];
  q5?: string;
  q6?: string;
  q7?: string;
  q7_followup?: "yes" | "no";
  q8?: string;
  q9?: string;
  q10?: string;
  q11?: string;
  q12?: string;
  q13?: string;
  q14?: string;
  q15?: string[];
  q16?: string;
  q17?: string;
  q18?: string;
  q19a?: number;
  q19b?: number;
  q20a?: number;
  q20b?: number;
  ed_followup?: "yes" | "no";
}

/* ============================================
 * Question lookup helpers
 * ============================================ */
export function getQuestion(id: string): Question | undefined {
  return QUESTIONS.find((q) => q.id === id);
}

export function getQuestionsBySection(section: 1 | 2 | 3 | 4 | 5): Question[] {
  return QUESTIONS.filter((q) => q.section === section);
}

/* ============================================
 * Cut label lookup (used in results / dashboard)
 * ============================================ */
export function getCutLabel(value: string): string {
  return CUTS.find((c) => c.value === value)?.label ?? value;
}
