# phases.md — Monk ModeX v1 Build Plan

8 phases. By the end of Phase 8, v1 is feature-complete, mobile-responsive, observable, and ready for ChatGPT Codex review.

## Phasing rationale

- **Phase 1** locks the aesthetic — the hardest design moment of v1. Don't move forward until it looks right.
- **Phase 2** builds the quiz as pure logic + UI with a mocked backend, so it's verifiable before any cloud setup.
- **Phase 3** stands up Supabase so subsequent phases can persist real data.
- **Phase 4** is the first full end-to-end milestone (quiz → AI diagnosis → preview), independent of payment.
- **Phase 5** adds the payment + protocol-generation gate, the most coupled piece in the system.
- **Phase 6** unlocks the dashboard — the surface the user lives in for 30-90 days.
- **Phase 7** fills in content + emails + the upgrade path.
- **Phase 8** is observability, perf, legal, and codex-review readiness.

## Critical path / lead times (start on day 1)

These have external lead times. Kick them off before you need them:

- **Lemon Squeezy verification** — 3-7 days. Apply during Phase 1.
- **Domain DNS propagation** — up to 48 hrs. Buy + point during Phase 1.
- **Resend domain verification** — DNS-dependent. Start during Phase 1.
- **Supabase project provision** — minutes. Start of Phase 3.

---

## Phase 1 — Foundation & design system

**Goal:** Bootstrap the project, lock the aesthetic, ship the landing page.

### Project bootstrap
- `pnpm create next-app` — Next.js 15, App Router, TypeScript strict, src dir convention
- Install Tailwind v4; configure `styles/tokens.css` with CSS variables from `CLAUDE.md` design tokens
- `next/font` for Fraunces, Inter, JetBrains Mono — self-hosted, no external CDN
- shadcn/ui primitives only (button, card, input, dialog, dropdown). Theme to oxblood.
- Phosphor or Lucide for icons (one or the other, pick one and stay)
- ESLint + a custom rule (or `eslint-plugin-import` zone config) enforcing the `lib/`/`services/` purity rule
- `tsconfig.json`: `strict: true`, path alias `@/*` → `src/*`
- `.env.example` template; `.env.local` in `.gitignore`

### Folder scaffold
Create empty: `app/(public)/`, `app/(auth)/`, `app/api/`, `lib/quiz/`, `lib/ai/prompts/`, `lib/protocol/`, `services/supabase/`, `services/openai/`, `services/lemonsqueezy/`, `services/email/`, `components/shared/`, `components/quiz/`, `components/dashboard/`, `components/marketing/`, `components/layouts/`, `content/research/`, `supabase/migrations/`.

### Shared primitives (`components/shared/`)
- `Button.tsx` — primary (oxblood), secondary, ghost, with disabled + hover states
- `Card.tsx` — surface bg, subtle border, padding from spacing scale
- `Input.tsx` + `Textarea.tsx`
- `PublicLayout.tsx` — minimal logo header + footer
- Type primitives: `H1`, `H2`, `H3`, `Body`, `Meta` components mapped to design tokens (so headers can never accidentally use Inter)

### Landing page (`app/(public)/page.tsx`)
- Hero: Fraunces headline + Inter subhead + single oxblood CTA → `/diagnostic`
- Section A — "Why this isn't another monk mode app" — 3 cards
- Section B — "How it works" — 3 numbered steps
- Section C — "What's included" — bullet list (Foundation + Operator)
- Footer with /research, /terms, /privacy, /refund links

### External setup (start, don't block)
- Buy domain, point DNS to Vercel
- Apply for Lemon Squeezy verification (note Wise USD account)
- Sign up for Resend, start domain verification

### Done when
- `pnpm dev` runs cleanly. `pnpm tsc --noEmit` passes. `pnpm lint` passes.
- Landing renders with correct typography, oxblood CTA, warm-black canvas, no FOUC.
- Mobile QA at 375px / 768px / 1280px.
- Lighthouse ≥ 90 on Performance / A11y / Best Practices / SEO for `/`.

---

## Phase 2 — Quiz (pure logic + UI, no backend)

**Goal:** Working diagnostic quiz that submits to a mocked endpoint with full safety-gate handling.

### Pure logic (`lib/quiz/`)
- `schema.ts` — types for all 20 questions across 5 sections, response shape, type-safe enums for option values
- `scoring.ts` — `scoreQuiz(responses) → ScoringOutput` (primary cut, secondary cuts, substrate scores, recommended duration, all four flags)
- `safety-gates.ts` — explicit pure functions: `isUnderAge`, `isSevereAud`, `isEdHistory`, `isPhq2High`, `isGad2High`. Each takes responses, returns boolean.
- Unit-test all scoring with ≥ 5 varied response sets (you don't need a test runner — a `lib/quiz/__scoring_check__.ts` script that logs results is fine for v1).

### Quiz UI (`components/quiz/`)
- `Quiz.tsx` — top-level state machine, one question per screen, back/forward navigation, keyboard support (tab + enter)
- `QuizQuestion.tsx` — renders single-select / multi-select / free-text / Likert based on question type
- `QuizProgress.tsx` — section indicator only (`Section 2 of 5`), no percentage bar
- `SafetyGateScreen.tsx` — full-screen interstitials for under-18, severe AUD, elevated PHQ-2/GAD-2, ED history. Resources listed; allow continue where applicable.

### Quiz route (`app/(public)/diagnostic/page.tsx`)
- Mounts `<Quiz />`
- On submit: `POST /api/diagnosis` (mock route returning `{ responseId: 'mock-id', diagnosis: '...' }` for now)
- Redirects to `/diagnostic/results/[responseId]` (results page is a placeholder for now)

### Done when
- Full 20-question flow works on mobile + desktop.
- Branching works (Q4 "None" → skip Q5/Q6, Q15 "no routines" branch, etc.).
- Each safety gate fires on the right answers. Verify all four flag paths.
- Keyboard navigation works.
- State holds across back/forward.

---

## Phase 3 — Database + auth foundation

**Goal:** Supabase project live; full schema, RLS, and types in place. Auth not yet active in the app.

### Supabase project
- Create project (separate from any existing one).
- Author `supabase/migrations/0001_initial_schema.sql` with: `profiles`, `quiz_responses`, `protocols`, `checkins`, `webhook_events` per `mmx.md` §6.
- Enable RLS on all user tables; add policies (users see their own rows only).
- Add triggers: `handle_new_user` (auto-create `profiles` on `auth.users` insert), `update_updated_at` (bump `updated_at`).
- Configure Auth settings: magic-link only, no passwords, no OAuth providers, set redirect URLs to localhost + production domain.

### Code wiring
- `services/supabase/client.ts` — browser client factory with anon key
- `services/supabase/server.ts` — server-side client + service-role helper for webhook
- `services/supabase/types.ts` — generated via `supabase gen types typescript --project-id ...`
- `services/supabase/queries/` — typed query helpers: `quiz.ts`, `protocol.ts`, `checkins.ts`, `user.ts`. Each exports pure-ish functions taking a client + args, returning typed rows.

### Done when
- Migrations apply cleanly on a fresh project.
- RLS verified — anonymous read returns empty for all protected tables.
- Generated types compile and are imported by query helpers.
- Triggers verified manually in SQL editor (insert into `auth.users` → row appears in `profiles`).

---

## Phase 4 — Diagnosis generation (first end-to-end milestone)

**Goal:** Quiz submission → AI diagnosis streams to UI → blurred preview + pricing card.

### AI integration
- OpenAI API key in env. Verify with a basic call.
- Install `ai` (Vercel AI SDK) + `openai`
- `lib/ai/prompts/system.ts` — shared system prompt enforcing voice + honesty rules + safety gate handling per `CLAUDE.md`
- `lib/ai/prompts/diagnosis.ts` — `buildDiagnosisPrompt(responses, scoring) → { system, user }`. 220-280 word prose target.
- `services/openai/client.ts`, `generate-diagnosis.ts` — streaming generator using AI SDK

### API + persistence
- `app/api/diagnosis/route.ts` — POST handler:
  1. Validate body (Zod)
  2. Run `scoreQuiz`
  3. Insert `quiz_responses` row with raw responses + flags + primary/secondary cuts + `session_token`
  4. Stream diagnosis to client via AI SDK; on completion, update row with `diagnosis_text` + `diagnosis_generated_at`
  5. Return `responseId` (early in stream so client can navigate)

### Results page (`app/(public)/diagnostic/results/[responseId]/page.tsx`)
- Server component — fetch `quiz_responses` by id (use `session_token` cookie/query param to authorize anonymous access)
- Render full diagnosis (try Fraunces + Inter for body, pick the one that lands)
- Blurred preview: `filter: blur(6px)` over placeholder structure (top cut, non-negotiables, daily structure, if-then plans, calendar)
- Pricing card with two CTAs (Foundation, Operator) — buttons are inert placeholders this phase

### Prompt iteration
- Test with ≥ 5 varied response sets — verify personalization is undeniable, not Mad Libs
- Verify safety-gate paths produce correct AI output (PHQ-2 high → support recommended, severe AUD → medical referral, etc.)
- Save prompt iterations in git; tune until voice is consistent and citations land naturally
- Manually QA every generation in early days

### Done when
- Quiz → diagnosis → results renders end-to-end with real OpenAI calls
- Streaming visible (text appears word-by-word)
- Diagnosis persists to DB
- 5+ test runs feel personalized; safety paths fire correctly
- No wellness-language drift in any sample output

---

## Phase 5 — Payments + protocol generation

**Goal:** User pays → webhook generates personalized protocol → stored in DB → user account created.

### Lemon Squeezy products
- Create two products: Foundation ($19), Operator ($39); note variant IDs into env
- Configure webhook → `https://[domain]/api/webhooks/lemon-squeezy`; note webhook secret
- Set Wise USD account as payout method (assumes Phase 1 verification completed)

### Checkout creation
- `services/lemonsqueezy/client.ts` — `lemonSqueezySetup` once
- `services/lemonsqueezy/create-checkout.ts` — `createCheckout({ tier, responseId, email })` returning hosted checkout URL; pass `responseId` + `tier` as `custom` data, set redirect to `/checkout/success`
- Wire "Unlock" buttons on results page → API route → redirect to LS hosted checkout

### Protocol shape (lib)
- `lib/protocol/types.ts` — full TS types: `Cut`, `IfThenPlan`, `NonNegotiable`, `WeekPlan`, `ProtocolNotes`, `Phase3BodyReset`, `Phase4MindReset`, `Protocol`
- `lib/protocol/validators.ts` — Zod schemas matching types (single source of truth — derive types from Zod)
- `lib/ai/prompts/protocol.ts` — `buildFoundationProtocolPrompt` + `buildOperatorProtocolPrompt` with JSON Schema for OpenAI Structured Outputs

### Protocol generation service
- `services/openai/generate-protocol.ts` — calls OpenAI with structured outputs, parses, validates with Zod, throws on failure (so webhook can retry)

### Webhook handler (`app/api/webhooks/lemon-squeezy/route.ts`)
1. Verify HMAC signature against `LEMON_SQUEEZY_WEBHOOK_SECRET` — reject 401 on mismatch
2. Idempotency: insert into `webhook_events` keyed on `(source, event_id)`; if already processed, return 200 deduplicated
3. On `order_created`:
   - Look up or create user via `supabase.auth.admin.createUser({ email, email_confirm: true })`
   - Update `quiz_responses` row: set `user_id`, `paid`, `paid_at`, `tier_purchased`, `lemon_squeezy_order_id`
   - Update `profiles`: set `tier`, `tier_purchased_at`
   - Generate protocol → Zod validate → insert `protocols` row with `start_date = today`
   - Mark webhook event processed
4. On `order_refunded`: downgrade `profiles.tier` to `'foundation'`, keep all data

### Success page (`app/(public)/checkout/success/page.tsx`)
- "Payment received" message in oxblood
- Copy: "We're generating your protocol. Check email in 60 sec."
- Poll `/api/protocols/status?response_id=...` for protocol-ready; show "Open dashboard" CTA when ready

### Iteration
- Test ≥ 5 varied user contexts → verify protocol is rich and consistently personalized
- Test all flag paths produce correct behavior (severe AUD → no alcohol cut; ED history → no TRE)
- Test refund path
- Test webhook replay → no duplicate user/protocol

### Done when
- LS test mode E2E: purchase → webhook fires → user created → protocol in DB → all rows correct
- Webhook idempotency confirmed (replay same event_id → skipped)
- HMAC signature verification rejects bad signatures
- Real-money smoke test (refund yourself) verifies downgrade
- Zod validation never throws on canonical test sets

---

## Phase 6 — Auth + dashboard

**Goal:** Magic-link login works; user lives in a personalized dashboard and can check in daily.

### Email + auth wiring
- Resend domain verified (from Phase 1 setup)
- `services/email/client.ts` — Resend client factory
- `services/email/send-magic-link.ts` — wraps Supabase `signInWithOtp` (server-side) with custom email template
- Wire magic-link send into webhook handler immediately after `protocols` insert
- Auth middleware (`middleware.ts`) — protect `(auth)` route group, redirect unauthed to `/`

### Dashboard layout
- `components/layouts/DashboardLayout.tsx` — left nav (desktop, collapsible) / bottom nav (mobile)
- Nav: Today · Diagnosis · Cuts · Foundation · Calendar · Journal · Settings

### Today screen (`app/(auth)/dashboard/page.tsx`)
- `IdentityHeader.tsx` — always visible, identity statement (from `profiles`) at top
- Day counter line (mono): `DAY 4 of 30 · FOUNDATION PHASE`
- `TodayCheckIn.tsx` — non-negotiables list with checkboxes; each shows title + anchor + tiny_action
- Optimistic update on tap → upsert into `checkins` (unique on `user_id, date`)
- Quiet completion line: `0 of 5 completed today` — no celebration, no animation
- Optional collapsible journal field — saves to `checkins.journal_text`

### Other dashboard screens
- `/dashboard/diagnosis` — read-only diagnosis from `quiz_responses.diagnosis_text`
- `/dashboard/cuts` — for each cut: target, days into recalibration (days since `start_date`, NOT a streak), self-binding strategies as setup checklist, if-then plans as cards
- `/dashboard/foundation` — full non-negotiables list expanded with research citations + rationales (educational mode)
- `/dashboard/calendar` — `CalendarGrid.tsx` — 30-day grid (or 90 for operator); each day filled by % completion (`completed_items.length / non_negotiables.length`); today bordered in oxblood; tap past day to view + retroactively edit; footer line `19 of 30 days logged` (no streak language)
- `/dashboard/journal` — list of past entries with dates, tap to edit, plain textarea
- `/dashboard/settings` — email (read-only), tier (read-only + upgrade button if foundation), timezone selector, sign out

### Tier gating
- `lib/auth/tier.ts` — helpers `isOperator(profile)`, `requireOperator(profile)`
- Operator-only content (phase_3/phase_4) hidden for foundation users in dashboard
- Server components verify tier at fetch boundary, not just UI

### Done when
- Full E2E: quiz → pay (LS test) → magic link arrives → click → lands on `/dashboard`
- Tap a non-negotiable → row upserts → calendar reflects on next render
- Refresh persists check-in state
- Foundation user does NOT see Phase 3/4 content
- Operator user DOES see Phase 3/4 content
- Mobile QA on every dashboard screen

---

## Phase 7 — Content, emails, upgrade

**Goal:** Bullshit Detector live, milestone emails sending, foundation → operator upgrade working.

### Bullshit Detector
- MDX support via `@next/mdx` or contentlayer-equivalent
- `app/(public)/research/page.tsx` — index card grid linking to each entry
- `app/(public)/research/[slug]/page.tsx` — render MDX from `content/research/`
- Initial 7 entries (write copy in MDX):
  - `dopamine-detox.mdx`
  - `21-day-myth.mdx`
  - `cold-exposure-truth.mdx`
  - `nofap-superpowers.mdx`
  - `grit-vs-conscientiousness.mdx`
  - `why-monk-mode-fails.mdx`
  - `lembke-pleasure-pain-balance.mdx`
- Each page: hero claim, evidence-based rebuttal, citations, soft CTA to diagnostic

### Email templates (React Email, in `emails/`)
- `MagicLink.tsx` — sign-in link
- `ProtocolReady.tsx` — sent after generation in case user closed success page
- `Day1Welcome.tsx` — sent on first dashboard activation
- `Day7CheckIn.tsx` — quiet "first week is hardest" note (Lembke framing)
- `Day30Completion.tsx` — soft upgrade nudge for foundation users
- All match dark/oxblood aesthetic

### Email scheduling
- Activation hook on first dashboard load (set `activated_at` on `protocols`) → enqueue Day1
- Vercel Cron or Supabase scheduled function: daily job that finds protocols at day 7 / day 30 and sends the corresponding email exactly once per protocol (track in a `sent_emails` table or column flag)
- Idempotent — running the job twice in one day sends each email at most once

### Upgrade flow (`app/(auth)/upgrade/page.tsx`)
- Pitch: "Unlock the full 90-day Operator Protocol"
- Use LS upgrade variant or full $39 charge — whichever LS supports cleanly
- On `order_created` for upgrade: regenerate protocol with operator tier, update `profiles.tier`, extend `duration_days` to 90, preserve check-in history

### Done when
- All 7 research pages render with correct typography + are SEO-indexed (sitemap entries)
- All 5 email templates render correctly in test inbox
- Day 1 / Day 7 / Day 30 emails fire at correct user-local times
- Upgrade: foundation user → click upgrade → pay → tier flips → phase_3/4 content unlocks → existing check-ins preserved

---

## Phase 8 — Polish, QA, launch

**Goal:** Production-ready and ready for ChatGPT Codex review.

### Observability
- Sentry: client + server SDKs, source maps, sensible sample rate
- Plausible (preferred for brand) or Vercel Analytics — page views only, no cookies
- Sentry alerts: failed webhook processing, OpenAI errors, Supabase connection failures

### Performance
- Lighthouse ≥ 90 on Performance / A11y / Best Practices / SEO across landing, results, dashboard
- Core Web Vitals green
- Image optimization via `next/image`; lazy-load below-fold
- Code-split dashboard from public bundle (route group helps)

### A11y
- Semantic HTML throughout (`<button>`, `<nav>`, `<main>`, etc.)
- Focus-visible states on all interactive elements (oxblood ring)
- Color contrast verified (oxblood on warm-black passes WCAG AA)
- Keyboard navigation across quiz + dashboard
- Screen reader sanity check on landing + quiz

### SEO + meta
- Per-route `generateMetadata` with title, description, OG image
- `manifest.json` (basic PWA — no service worker)
- `sitemap.xml` + `robots.txt`
- Article structured data on `/research/[slug]`

### Legal pages
- `/terms` — terms of service + 30-day refund policy + product disclaimers ("not medical advice")
- `/privacy` — what's collected, why, retention, GDPR/CCPA rights
- `/refund` — 30-day money-back terms

### Code quality (pre-Codex)
- `pnpm lint` clean
- `pnpm tsc --noEmit` clean
- No `TODO` / `FIXME` / `console.log` in committed code
- No commented-out code blocks
- Lib purity rule passes: `lib/` and `services/` import nothing from `react`/`next`/DOM (verify with the lint rule from Phase 1)
- README documents: stack, local setup, env vars, deploy steps, migration commands
- All env vars present in `.env.example` with placeholder values

### Domain + production deploy
- Custom domain DNS pointed to Vercel
- Production env vars set in Vercel dashboard (separate Supabase project for prod recommended)
- LS webhook URL updated to production domain
- Resend domain verified for production sending
- Run migrations against production Supabase

### Real-money smoke test
- Buy Foundation with own card → full E2E verified
- Buy Operator → upgrade content appears
- Refund both → tier downgrade verified, data preserved

### Mobile QA
- Real iPhone Safari test
- Real Android Chrome test
- All flows work touch-only with no broken layouts at 375px width

### Done when
- Lighthouse all green
- Codex review can run without warnings
- Live URL serves real users for 24 hrs without Sentry errors
- All v1 spec items in `mmx.md` §9 are implemented or explicitly deferred to v2 with a note

---

## Out of scope for v1 (do not build, even if tempted)

These belong in v2. If a phase tempts you toward them, stop:

- Mobile / native apps (RN, Tauri)
- Phase 5 (Output) and Phase 6 (Integration) of the protocol
- Sleep/wearable tracking
- Meditation timer
- Weekly review flow
- Monthly retrospective
- Community / accountability features
- A/B testing tooling
- Feature flags
- Gamification of any form
- Daily push notifications
