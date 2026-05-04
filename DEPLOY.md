# Deploying Monk ModeX

A 10-minute walkthrough from clean clone to live production URL on Vercel.

## Prerequisites

- A Vercel account (free)
- A Supabase project (free) — or fork the existing dev one
- An Anthropic API key — from https://console.anthropic.com/settings/keys
- (Optional) Sentry project, Resend account, Lemon Squeezy store

## 1. Vercel project

1. Go to https://vercel.com/new
2. Import the GitHub repo (`Arun-Sanjay/monkmodex`)
3. Framework preset: **Next.js** (auto-detected)
4. Root directory: `./` (default)
5. Click **Deploy** — the first deploy will fail without env vars, that's fine

## 2. Environment variables

In **Project → Settings → Environment Variables**, add (Production + Preview):

| Key | Source |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project settings → API (**server-only**, never `NEXT_PUBLIC_`) |
| `ANTHROPIC_API_KEY` | Anthropic console |
| `NEXT_PUBLIC_APP_URL` | `https://monkmodex.com` (or your domain) |
| `NEXT_PUBLIC_APP_NAME` | `Monk ModeX` |

Optional:

| Key | Notes |
|---|---|
| `SENTRY_DSN` | Server-side errors |
| `NEXT_PUBLIC_SENTRY_DSN` | Browser-side errors |
| `RESEND_API_KEY` | Transactional + milestone emails |
| `RESEND_FROM_EMAIL` | e.g. `Monk ModeX <hello@monkmodex.com>` |
| `LEMON_SQUEEZY_*` | When wiring payments |

## 3. Supabase setup

If using a fresh project, apply the migrations in `supabase/migrations/` via the SQL editor. Or use the Supabase MCP / CLI to push them.

Auth → URL Configuration → set:
- Site URL: `https://monkmodex.com`
- Redirect URLs: `https://monkmodex.com/auth/callback`, plus the Vercel preview pattern: `https://monkmodex-*.vercel.app/auth/callback`

Auth → Email Templates → optional: customize the magic-link template to match the MMX voice.

## 4. Trigger redeploy

Push a commit, or hit **Redeploy** in Vercel. Now that env vars are set, the build will succeed.

## 5. Domain

In **Project → Settings → Domains**, add `monkmodex.com`. Vercel walks you through the DNS records you need at your registrar.

## 6. Smoke test

Visit production and walk:

- [ ] `/` loads, hero renders
- [ ] `/diagnostic` → 20 questions complete → loading screen → results page
- [ ] Unlock Operator → ~30s loader → `/dashboard`
- [ ] Today, Calendar, Journal, Cuts, Foundation, Diagnosis all render
- [ ] `/sign-in` → magic-link email arrives → clicks → `/auth/claim` → `/dashboard`
- [ ] Settings shows email + sign-out
- [ ] Sign out → home
- [ ] Refresh `/dashboard/diagnosis` → Download PDF opens print dialog
- [ ] `/sitemap.xml` and `/robots.txt` return clean content

## 7. Rate limit + cost guard

Confirm in Supabase:

```sql
SELECT * FROM rate_limit_buckets ORDER BY window_start DESC LIMIT 5;
```

Trigger 4 diagnosis attempts from the same IP — the 4th should return 429.

## 8. Post-deploy

- Add the production URL to Anthropic's allowed origins (if you set any).
- If using a custom email domain with Resend, complete domain verification.
- Set up Sentry alerts.
