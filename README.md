# Monk ModeX

The evidence-based version of monk mode. Personalized diagnostic + protocol generator built on addiction-medicine research.

This is the **dev build** — full app minus auth and payments. Auth (Supabase magic links) and payments (Lemon Squeezy) get wired in for the shippable version. See `phases.md` for the full plan.

## Stack

- **Next.js 16** (App Router) · **TypeScript** strict · **Tailwind v4**
- **Supabase** — Postgres for quiz responses, protocols, check-ins
- **Anthropic Claude** (Claude Opus 4.7 default) — diagnosis + protocol generation, with prompt caching on the system prompt and structured outputs for the protocol JSON
- **Zod** — runtime validation of AI structured output before persistence

## Getting started

### 1. Install

```bash
pnpm install
```

### 2. Create a Supabase project

- Sign up at [supabase.com](https://supabase.com), create a project.
- Open the **SQL Editor** in the Supabase dashboard.
- Paste the contents of `supabase/migrations/0001_initial_schema.sql` and run.
- From **Project Settings → API**, copy the project URL, anon key, and service role key.

### 3. Get an Anthropic API key

- Get one at [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys).

### 4. Configure env vars

```bash
cp .env.example .env.local
```

Fill in:

```
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run

```bash
pnpm dev
```

Open `http://localhost:3000`.

## End-to-end flow (current build)

1. Land on `/`.
2. Click **Start the diagnostic** → 20-question quiz at `/diagnostic`.
3. Submit → a quiz response row is created, the AI diagnosis streams in, and you redirect to `/diagnostic/results/[responseId]`.
4. On the results page, click **Unlock Foundation** or **Unlock Operator** → the AI generates a structured protocol (JSON-validated against Zod) and writes a `protocols` row.
5. Redirected to `/dashboard`. Today's non-negotiables, calendar, cuts, foundation, journal, settings — all available.

In the shippable version, step 4 is gated by a Lemon Squeezy webhook. In dev, any session that owns the quiz response can unlock without payment.

## Project layout

```
src/
  app/                      # Next.js routes (web-only)
    page.tsx                # Landing
    diagnostic/             # Quiz + results
    dashboard/              # Today, Diagnosis, Cuts, Foundation, Calendar, Journal, Settings
    research/               # Bullshit Detector
    api/                    # diagnosis, protocol, checkins
    terms, privacy, refund/ # Legal placeholders
  lib/                      # PURE — no react/next/DOM imports
    quiz/                   # Schema, scoring, safety gates, flow
    ai/prompts/             # System + diagnosis + protocol prompts
    protocol/               # Zod types + extract helpers
    cn.ts, date.ts, constants.ts
  services/                 # SIDE EFFECTS
    supabase/               # Client + queries + types
    anthropic/              # Client + generate-diagnosis + generate-protocol
    session.ts              # Cookie-based session token (replaces auth in dev)
  components/               # WEB-ONLY
    shared/                 # Button, Card, Input, Type primitives
    quiz/                   # Quiz state machine + question + safety gate UI
    dashboard/              # IdentityHeader, TodayCheckIn, CalendarGrid
    layouts/                # PublicLayout, DashboardLayout
    marketing/              # Landing sections
  content/research/         # Bullshit Detector articles (TSX modules)
supabase/migrations/        # SQL — run via Supabase SQL Editor
```

## How identification works (dev mode)

There's no auth yet. Every browser session gets a UUID `session_token` stored in an httpOnly cookie when they hit `/api/diagnosis`. All data ties to that token. When real auth lands:

- Add a `user_id uuid references auth.users(id)` column to each table.
- Backfill `user_id` from `session_token` once a user signs in (or merge by email).
- Drop the cookie path; use `auth.uid()` everywhere.

## Anthropic specifics

- **Model:** `claude-opus-4-7` by default. Override with `ANTHROPIC_MODEL` in `.env.local`.
- **Prompt caching:** the system prompt (~3K tokens of voice rules + protocol backbone + research context) is sent with `cache_control: { type: "ephemeral" }`. Repeated diagnosis/protocol calls within 5 min read it from cache at ~10% cost.
- **Structured outputs:** the protocol JSON is enforced via `output_config.format` with a Zod-derived JSON schema. The output is then re-validated by Zod before write to Postgres.
- **Streaming:** both diagnosis and protocol use `client.messages.stream()` + `.finalMessage()` to avoid HTTP timeouts on long outputs.

## What's deliberately not built (yet)

- **Auth.** Supabase magic-link auth comes next. The cookie-based session token will be migrated to `auth.uid()`.
- **Payments.** Lemon Squeezy + webhook-driven protocol generation come after auth. The current `/api/protocol` endpoint becomes the webhook handler with HMAC verification + idempotency.
- **Emails.** Day 1 / Day 7 / Day 30 milestone emails via Resend.
- **Streaming UI.** Diagnosis currently returns after full generation; SSE token-by-token is a small follow-up.
- **Phase 5 (Output) and Phase 6 (Integration)** of the protocol — out of v1 scope per `mmx.md`.

## Code-quality invariants

- `lib/` and `services/` import nothing from `react` / `next` / DOM. Pure logic / IO only — those folders port verbatim to React Native + Tauri in v2.
- All AI structured output is validated via Zod before persistence.
- The four safety flags (`flagged_phq2_high`, `flagged_gad2_high`, `flagged_severe_aud`, `flagged_ed_history`) gate AI prompts AND UI rendering. Liability gates, not feature flags.
- No emoji anywhere — code, UI, or copy.
- Voice rules (operator-grade, no wellness language) per `CLAUDE.md`.

See `CLAUDE.md` for the load-bearing rules. `phases.md` for the build plan. `mmx.md` for the full product spec.

## Useful commands

```bash
pnpm dev           # Dev server (Turbopack)
pnpm build         # Production build
pnpm lint          # ESLint
pnpm tsc --noEmit  # Strict TS check
```
