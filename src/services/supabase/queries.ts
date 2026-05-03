/**
 * Typed query helpers — keeps API routes thin.
 */

import { getServiceClient } from "./server";
import type { CheckinRow, ProtocolRow, QuizResponseRow, Tier } from "./types";

/* ============================================
 * QUIZ RESPONSES
 * ============================================ */
export async function insertQuizResponse(input: {
  sessionToken: string;
  responses: Record<string, unknown>;
  flags: {
    severeAud: boolean;
    edHistory: boolean;
    phq2High: boolean;
    gad2High: boolean;
  };
  primaryCut: string | null;
  secondaryCuts: string[];
  identityStatement: string | null;
}): Promise<QuizResponseRow> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("quiz_responses")
    .insert({
      session_token: input.sessionToken,
      responses: input.responses,
      flagged_severe_aud: input.flags.severeAud,
      flagged_ed_history: input.flags.edHistory,
      flagged_phq2_high: input.flags.phq2High,
      flagged_gad2_high: input.flags.gad2High,
      primary_cut: input.primaryCut,
      secondary_cuts: input.secondaryCuts,
      identity_statement: input.identityStatement,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to insert quiz response: ${error?.message ?? "unknown error"}`);
  }
  return data;
}

export async function setDiagnosisText(
  responseId: string,
  diagnosisText: string
): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase
    .from("quiz_responses")
    .update({
      diagnosis_text: diagnosisText,
      diagnosis_generated_at: new Date().toISOString(),
    })
    .eq("id", responseId);
  if (error) {
    throw new Error(`Failed to update diagnosis: ${error.message}`);
  }
}

export async function setDiagnosisData(
  responseId: string,
  data: import("./types").DiagnosisData
): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase
    .from("quiz_responses")
    .update({
      diagnosis_text: data.prose,
      diagnosis_data: data,
      diagnosis_generated_at: new Date().toISOString(),
    })
    .eq("id", responseId);
  if (error) {
    throw new Error(`Failed to update diagnosis: ${error.message}`);
  }
}

export async function getQuizResponseById(
  responseId: string
): Promise<QuizResponseRow | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("quiz_responses")
    .select("*")
    .eq("id", responseId)
    .maybeSingle();
  if (error) throw new Error(`Failed to fetch quiz response: ${error.message}`);
  return data;
}

export async function setUnlockTier(
  responseId: string,
  tier: Tier
): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase
    .from("quiz_responses")
    .update({ tier, unlocked_at: new Date().toISOString() })
    .eq("id", responseId);
  if (error) throw new Error(`Failed to set tier: ${error.message}`);
}

/* ============================================
 * PROTOCOLS
 * ============================================ */
export async function insertProtocol(input: {
  sessionToken: string;
  quizResponseId: string;
  tier: Tier;
  durationDays: 30 | 90;
  protocolData: Record<string, unknown>;
  identityStatement: string | null;
  startDate: string; // YYYY-MM-DD
}): Promise<ProtocolRow> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("protocols")
    .insert({
      session_token: input.sessionToken,
      quiz_response_id: input.quizResponseId,
      tier: input.tier,
      duration_days: input.durationDays,
      protocol_data: input.protocolData,
      identity_statement: input.identityStatement,
      start_date: input.startDate,
    })
    .select()
    .single();
  if (error || !data) {
    throw new Error(`Failed to insert protocol: ${error?.message ?? "unknown"}`);
  }
  return data;
}

export async function getActiveProtocol(
  sessionToken: string
): Promise<ProtocolRow | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("protocols")
    .select("*")
    .eq("session_token", sessionToken)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Failed to fetch protocol: ${error.message}`);
  return data;
}

export async function getProtocolByQuizResponseId(
  quizResponseId: string
): Promise<ProtocolRow | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("protocols")
    .select("*")
    .eq("quiz_response_id", quizResponseId)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Failed to fetch protocol: ${error.message}`);
  return data;
}

export async function activateProtocol(protocolId: string): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase
    .from("protocols")
    .update({ activated_at: new Date().toISOString() })
    .eq("id", protocolId)
    .is("activated_at", null);
  if (error) throw new Error(`Failed to activate protocol: ${error.message}`);
}

/* ============================================
 * CHECKINS
 * ============================================ */
export async function upsertCheckin(input: {
  sessionToken: string;
  protocolId: string;
  date: string; // YYYY-MM-DD
  completedItems: string[];
  journalText?: string | null;
}): Promise<CheckinRow> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("checkins")
    .upsert(
      {
        session_token: input.sessionToken,
        protocol_id: input.protocolId,
        date: input.date,
        completed_items: input.completedItems,
        journal_text: input.journalText ?? null,
      },
      { onConflict: "session_token,date" }
    )
    .select()
    .single();
  if (error || !data) {
    throw new Error(`Failed to upsert checkin: ${error?.message ?? "unknown"}`);
  }
  return data;
}

export async function getCheckinsForProtocol(
  protocolId: string
): Promise<CheckinRow[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("checkins")
    .select("*")
    .eq("protocol_id", protocolId)
    .order("date", { ascending: false });
  if (error) throw new Error(`Failed to fetch checkins: ${error.message}`);
  return data ?? [];
}

export async function getCheckinByDate(
  sessionToken: string,
  date: string
): Promise<CheckinRow | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("checkins")
    .select("*")
    .eq("session_token", sessionToken)
    .eq("date", date)
    .maybeSingle();
  if (error) throw new Error(`Failed to fetch checkin: ${error.message}`);
  return data;
}
