/**
 * Supabase database types.
 *
 * In production these would be generated via `supabase gen types typescript`.
 * Hand-rolled here to avoid requiring the Supabase CLI for local dev.
 * Keep in sync with supabase/migrations/0001_initial_schema.sql.
 *
 * Note: these are `type` aliases (not `interface`) so they satisfy
 * `Record<string, unknown>` constraints in supabase-js's GenericTable.
 * Interfaces don't extend Record<string, ...> due to declaration-merge
 * openness; types do.
 */

export type Tier = "foundation" | "operator";

export type DiagnosisCitation = {
  id: number;
  author: string;
  year: number;
  title: string;
  journal?: string | null;
  finding?: string | null;
};

export type DiagnosisData = {
  prose: string;
  headline: string;
  pull_quotes: string[];
  citations: DiagnosisCitation[];
};

export type QuizResponseRow = {
  id: string;
  session_token: string;
  user_id: string | null;
  responses: Record<string, unknown>;
  diagnosis_text: string | null;
  diagnosis_data: DiagnosisData | null;
  diagnosis_generated_at: string | null;
  flagged_severe_aud: boolean;
  flagged_ed_history: boolean;
  flagged_phq2_high: boolean;
  flagged_gad2_high: boolean;
  primary_cut: string | null;
  secondary_cuts: string[];
  identity_statement: string | null;
  tier: Tier | null;
  unlocked_at: string | null;
  created_at: string;
  updated_at: string;
};

export type QuizResponseInsert = {
  id?: string;
  session_token: string;
  user_id?: string | null;
  responses: Record<string, unknown>;
  diagnosis_text?: string | null;
  diagnosis_data?: DiagnosisData | null;
  diagnosis_generated_at?: string | null;
  flagged_severe_aud?: boolean;
  flagged_ed_history?: boolean;
  flagged_phq2_high?: boolean;
  flagged_gad2_high?: boolean;
  primary_cut?: string | null;
  secondary_cuts?: string[];
  identity_statement?: string | null;
  tier?: Tier | null;
  unlocked_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type QuizResponseUpdate = Partial<QuizResponseInsert>;

export type ProtocolRow = {
  id: string;
  session_token: string;
  user_id: string | null;
  quiz_response_id: string;
  tier: Tier;
  duration_days: 30 | 90;
  protocol_data: Record<string, unknown>;
  identity_statement: string | null;
  start_date: string;
  generated_at: string;
  activated_at: string | null;
  version: number;
};

export type ProtocolInsert = {
  id?: string;
  session_token: string;
  user_id?: string | null;
  quiz_response_id: string;
  tier: Tier;
  duration_days: 30 | 90;
  protocol_data: Record<string, unknown>;
  identity_statement?: string | null;
  start_date: string;
  generated_at?: string;
  activated_at?: string | null;
  version?: number;
};

export type ProtocolUpdate = Partial<ProtocolInsert>;

export type CheckinRow = {
  id: string;
  session_token: string;
  user_id: string | null;
  protocol_id: string;
  date: string;
  completed_items: string[];
  journal_text: string | null;
  mood_rating: number | null;
  energy_rating: number | null;
  sleep_hours: number | null;
  created_at: string;
  updated_at: string;
};

export type CheckinInsert = {
  id?: string;
  session_token: string;
  user_id?: string | null;
  protocol_id: string;
  date: string;
  completed_items?: string[];
  journal_text?: string | null;
  mood_rating?: number | null;
  energy_rating?: number | null;
  sleep_hours?: number | null;
  created_at?: string;
  updated_at?: string;
};

export type CheckinUpdate = Partial<CheckinInsert>;

export type RateLimitBucketRow = {
  bucket_key: string;
  count: number;
  window_start: string;
};
export type RateLimitBucketInsert = {
  bucket_key: string;
  count: number;
  window_start?: string;
};
export type RateLimitBucketUpdate = Partial<RateLimitBucketInsert>;

export type Database = {
  __InternalSupabase: { PostgrestVersion: "12" };
  public: {
    Tables: {
      quiz_responses: {
        Row: QuizResponseRow;
        Insert: QuizResponseInsert;
        Update: QuizResponseUpdate;
        Relationships: [];
      };
      protocols: {
        Row: ProtocolRow;
        Insert: ProtocolInsert;
        Update: ProtocolUpdate;
        Relationships: [];
      };
      checkins: {
        Row: CheckinRow;
        Insert: CheckinInsert;
        Update: CheckinUpdate;
        Relationships: [];
      };
      rate_limit_buckets: {
        Row: RateLimitBucketRow;
        Insert: RateLimitBucketInsert;
        Update: RateLimitBucketUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
