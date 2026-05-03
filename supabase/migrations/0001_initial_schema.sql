-- ============================================================
-- Monk ModeX — initial schema
-- ============================================================
-- This migration is the v1-without-auth schema. Identification is via
-- a `session_token` (uuid) stored in an httpOnly cookie. When auth is
-- added later, we'll add a `user_id uuid references auth.users(id)`
-- column to each table and backfill from session_token.
--
-- All access goes through API routes using the service role key. RLS is
-- intentionally disabled here since there's no auth.uid() to compare
-- against; turn it on when auth is wired up.
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- QUIZ RESPONSES
-- ============================================================
create table public.quiz_responses (
  id uuid primary key default gen_random_uuid(),
  session_token uuid not null,

  -- Raw quiz data
  responses jsonb not null,

  -- AI-generated diagnosis (saved after streaming completes)
  diagnosis_text text,
  diagnosis_generated_at timestamptz,

  -- Safety flags from quiz scoring
  flagged_severe_aud boolean default false not null,
  flagged_ed_history boolean default false not null,
  flagged_phq2_high boolean default false not null,
  flagged_gad2_high boolean default false not null,

  -- Hijack Index output
  primary_cut text,
  secondary_cuts text[] default '{}'::text[] not null,

  -- Identity statement (from Q18)
  identity_statement text,

  -- Tier (set when user "unlocks" — replaces payment in dev mode)
  tier text check (tier in ('foundation', 'operator')),
  unlocked_at timestamptz,

  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_quiz_responses_session_token on quiz_responses(session_token);
create index idx_quiz_responses_created_at on quiz_responses(created_at desc);

-- ============================================================
-- PROTOCOLS (the AI-generated personalized plan)
-- ============================================================
create table public.protocols (
  id uuid primary key default gen_random_uuid(),
  session_token uuid not null,
  quiz_response_id uuid references quiz_responses(id) on delete cascade not null,

  tier text check (tier in ('foundation', 'operator')) not null,
  duration_days int not null check (duration_days in (30, 90)),

  -- Validated against Zod schema in app layer; jsonb here so schema can evolve.
  -- Shape: { cuts[], non_negotiables[], weeks[], protocol_notes,
  --          phase_3_body_reset?, phase_4_mind_reset? }
  protocol_data jsonb not null,

  identity_statement text,
  start_date date not null,
  generated_at timestamptz default now() not null,
  activated_at timestamptz,

  version int default 1 not null
);

create index idx_protocols_session_token on protocols(session_token);
create index idx_protocols_quiz_response_id on protocols(quiz_response_id);

-- ============================================================
-- DAILY CHECK-INS
-- ============================================================
create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  session_token uuid not null,
  protocol_id uuid references protocols(id) on delete cascade not null,

  -- User's local date
  date date not null,

  -- Which non-negotiable IDs were completed
  completed_items text[] default '{}'::text[] not null,

  -- Optional fields
  journal_text text,
  mood_rating int check (mood_rating between 1 and 5),
  energy_rating int check (energy_rating between 1 and 5),
  sleep_hours numeric(3,1),

  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  -- One checkin per session per day
  unique (session_token, date)
);

create index idx_checkins_session_token_date on checkins(session_token, date desc);

-- ============================================================
-- TRIGGERS — auto-bump updated_at
-- ============================================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger quiz_responses_updated_at
  before update on quiz_responses
  for each row execute function update_updated_at_column();

create trigger checkins_updated_at
  before update on checkins
  for each row execute function update_updated_at_column();
