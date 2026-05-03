# CLAUDE.md — Monk ModeX

Coding rules. The full product spec lives in `mmx.md` for context — implementation will be directed by the user.

## Stack

Next.js 15 (App Router) · TypeScript strict · Tailwind v4 + shadcn/ui · Supabase (Postgres + magic-link auth) · OpenAI via Vercel AI SDK · Lemon Squeezy · Resend · Sentry · Vercel.

No Redux/Zustand, no Prisma, no NextAuth, no tRPC, no CMS, no native apps — v1 is web only.

## Architecture (load-bearing)

Three-layer separation:

- **`lib/`** — pure logic. Zero imports from `react`, `next`, or DOM. No `window`/`document`/`localStorage`.
- **`services/`** — side effects (Supabase, OpenAI, Lemon Squeezy, Resend). No `react`/DOM. Thin adapter for `next/server`.
- **`components/`** — web-only. Tailwind throughout.

Reason: `lib/` and `services/` port verbatim to React Native / Tauri in v2. AI prompts always live in `lib/ai/prompts/`.

Validate every AI structured output with **Zod** before persisting. Use generated Supabase types — don't hand-roll DB types.

## Design tokens

```ts
bg:     { canvas: '#0a0a0c', surface: '#141417', elevated: '#1c1c20', inset: '#06060a' }
text:   { primary: '#f5f4f1', secondary: '#9a978f', tertiary: '#5c5a55' }
accent: { base: '#7a1f24', hover: '#8e2530', muted: '#3a1416' }   // deep oxblood
border: { subtle: '#2a2a2e', default: '#34343a', strong: '#4a4a52' }
state:  { success: '#7a8870', warning: '#a08040', danger: '#8e2530' }   // muted, NEVER bright
```

Oxblood must read as leather/wine, never as error red. Always pair with **warm** neutrals — never cool grays or pure white.

Fonts (via `next/font`, self-hosted): **Fraunces** (headers, weight 400, tracking -0.015 to -0.02em) · **Inter** (body + UI) · **JetBrains Mono** (numbers, dates, metadata).

4px spacing unit. Radii: 8px cards / 6px buttons / 4px inputs. Animations 200-300ms ease-out, subtle fades only.

Icons: Phosphor or Lucide, outlined, never filled. **No emoji anywhere.** Imagery: monochrome only, no people.

## Anti-supernormal-stimulus (affects every UI choice)

The product can't have the patterns the protocol cures:

- No XP, levels, badges, or streaks-that-reset. A "current day" counter is fine; a count that zeros on a missed day is forbidden.
- Calendar shows past days as % completion (0-100% fill). Never reset, never "broken streak."
- No celebration animations on check-in. No confetti, no sound, no haptics.
- No daily push, no "your streak is at risk" copy. Only transactional + milestone emails.

## Voice & copy

**Use:** reward recalibration (not "dopamine detox") · high-friction behavior (not "addiction") · lapse (not "relapse") · operator (not "user") · protocol (not "plan") · cuts · foundation. Second person. Specific numbers and timelines.

**Never:** crushing it · leveling up · life hack · journey · transformation · unleash · manifest · vibrate · literally (filler) · addict · relapse · any wellness-Instagram language.

Tone: operator-grade — direct, unsentimental, evidence-grounded. Never preachy, never wellness, never bro.

## Safety gates (non-negotiable)

The quiz produces four flags that gate UI rendering AND pass into AI prompts:

- `flagged_phq2_high` — show resources; AI recommends professional support.
- `flagged_gad2_high` — same handling.
- `flagged_severe_aud` — medical referral; **never recommend alcohol abstinence as a cut**.
- `flagged_ed_history` — **disable all TRE / fasting / calorie content** in protocol generation.

Liability gates, not feature flags. Never dismissible.

## Domain semantics

- Two tiers: `'foundation'` (30d, Phase 1+2) and `'operator'` (90d, Phases 1-4). Phases 5+ are out of v1 scope.
- Each non-negotiable anchors to a routine the user already has (Fogg: *"After I [anchor], I will [tiny habit]"*).
- Each cut has 2-3 self-binding strategies + 2-3 if-then plans (Gollwitzer).


## Project Review 
The code will be reviewed and checked by chatgpt codex after completition. 