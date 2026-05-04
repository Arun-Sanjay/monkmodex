/**
 * Typed query helpers — keeps API routes and server components thin.
 *
 * Every read takes an `Owner` so we can route to the right scope:
 *  - { kind: "user" }    → WHERE user_id = X
 *  - { kind: "session" } → WHERE session_token = Y AND user_id IS NULL
 *
 * Writes record both `session_token` (always) and `user_id` (when authed)
 * so the Settings → Sign In claim flow has a single column to update.
 */

import { getServiceClient } from "./server";
import type { Owner } from "@/services/owner";
import type { CheckinRow, LapseRow, ProtocolRow, QuizResponseRow, Tier } from "./types";

/* ============================================
 * QUIZ RESPONSES
 * ============================================ */
export async function insertQuizResponse(input: {
  owner: Owner;
  sessionToken: string; // always recorded so anonymous→authed claim has the link
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
      user_id: input.owner.kind === "user" ? input.owner.userId : null,
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

/**
 * List all quiz_responses for an owner. Used by the claim flow to see
 * what anonymous data the device has accumulated.
 */
export async function listQuizResponsesByOwner(
  owner: Owner
): Promise<QuizResponseRow[]> {
  const supabase = getServiceClient();
  let q = supabase.from("quiz_responses").select("*");
  if (owner.kind === "user") {
    q = q.eq("user_id", owner.userId);
  } else {
    q = q.eq("session_token", owner.sessionToken).is("user_id", null);
  }
  const { data, error } = await q.order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to list quiz responses: ${error.message}`);
  return data ?? [];
}

/**
 * For the auth callback — bypasses the user_id filter so we can detect
 * orphaned anonymous rows that this device's cookie owns.
 */
export async function getQuizResponsesBySession(
  sessionToken: string
): Promise<QuizResponseRow[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("quiz_responses")
    .select("*")
    .eq("session_token", sessionToken)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to fetch session quiz responses: ${error.message}`);
  return data ?? [];
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
  owner: Owner;
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
      user_id: input.owner.kind === "user" ? input.owner.userId : null,
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
  owner: Owner
): Promise<ProtocolRow | null> {
  const supabase = getServiceClient();
  let q = supabase.from("protocols").select("*");
  if (owner.kind === "user") {
    q = q.eq("user_id", owner.userId);
  } else {
    q = q.eq("session_token", owner.sessionToken).is("user_id", null);
  }
  const { data, error } = await q
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Failed to fetch protocol: ${error.message}`);
  return data;
}

/**
 * Bypass owner — used by the auth callback to detect orphaned anonymous
 * protocols the device's session cookie owns.
 */
export async function getActiveProtocolBySession(
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
  if (error) throw new Error(`Failed to fetch protocol by session: ${error.message}`);
  return data;
}

export async function getActiveProtocolByUserId(
  userId: string
): Promise<ProtocolRow | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("protocols")
    .select("*")
    .eq("user_id", userId)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Failed to fetch protocol by user: ${error.message}`);
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
  owner: Owner;
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
        user_id: input.owner.kind === "user" ? input.owner.userId : null,
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
  owner: Owner,
  date: string
): Promise<CheckinRow | null> {
  const supabase = getServiceClient();
  let q = supabase.from("checkins").select("*").eq("date", date);
  if (owner.kind === "user") {
    q = q.eq("user_id", owner.userId);
  } else {
    q = q.eq("session_token", owner.sessionToken).is("user_id", null);
  }
  const { data, error } = await q.maybeSingle();
  if (error) throw new Error(`Failed to fetch checkin: ${error.message}`);
  return data;
}

/* ============================================
 * LAPSES
 * ============================================ */
export async function insertLapse(input: {
  owner: Owner;
  sessionToken: string;
  protocolId: string;
  cutTarget: string;
  trigger?: string | null;
  thirtyMinBefore?: string | null;
  notes?: string | null;
}): Promise<LapseRow> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("lapses")
    .insert({
      session_token: input.sessionToken,
      user_id: input.owner.kind === "user" ? input.owner.userId : null,
      protocol_id: input.protocolId,
      cut_target: input.cutTarget,
      trigger: input.trigger ?? null,
      thirty_min_before: input.thirtyMinBefore ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single();
  if (error || !data) {
    throw new Error(`Failed to insert lapse: ${error?.message ?? "unknown"}`);
  }
  return data;
}

export async function listLapsesForProtocol(
  protocolId: string
): Promise<LapseRow[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("lapses")
    .select("*")
    .eq("protocol_id", protocolId)
    .order("occurred_at", { ascending: false });
  if (error) throw new Error(`Failed to fetch lapses: ${error.message}`);
  return data ?? [];
}

export async function listLapsesForCut(
  protocolId: string,
  cutTarget: string
): Promise<LapseRow[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("lapses")
    .select("*")
    .eq("protocol_id", protocolId)
    .eq("cut_target", cutTarget)
    .order("occurred_at", { ascending: false });
  if (error) throw new Error(`Failed to fetch lapses: ${error.message}`);
  return data ?? [];
}

/* ============================================
 * CLAIM — bind anonymous session_token rows to a user
 * ============================================ */
export async function claimSessionForUser(
  sessionToken: string,
  userId: string
): Promise<{
  quiz_responses: number;
  protocols: number;
  checkins: number;
  lapses: number;
}> {
  const supabase = getServiceClient();

  const qr = await supabase
    .from("quiz_responses")
    .update({ user_id: userId })
    .eq("session_token", sessionToken)
    .is("user_id", null)
    .select("id");
  if (qr.error) throw new Error(`Claim quiz_responses failed: ${qr.error.message}`);

  const p = await supabase
    .from("protocols")
    .update({ user_id: userId })
    .eq("session_token", sessionToken)
    .is("user_id", null)
    .select("id");
  if (p.error) throw new Error(`Claim protocols failed: ${p.error.message}`);

  const c = await supabase
    .from("checkins")
    .update({ user_id: userId })
    .eq("session_token", sessionToken)
    .is("user_id", null)
    .select("id");
  if (c.error) throw new Error(`Claim checkins failed: ${c.error.message}`);

  const l = await supabase
    .from("lapses")
    .update({ user_id: userId })
    .eq("session_token", sessionToken)
    .is("user_id", null)
    .select("id");
  if (l.error) throw new Error(`Claim lapses failed: ${l.error.message}`);

  return {
    quiz_responses: qr.data?.length ?? 0,
    protocols: p.data?.length ?? 0,
    checkins: c.data?.length ?? 0,
    lapses: l.data?.length ?? 0,
  };
}

/* ============================================
 * EXPORT — full data dump for an owner (Settings → Export)
 * ============================================ */
export async function exportOwnerData(owner: Owner): Promise<{
  quiz_responses: QuizResponseRow[];
  protocols: ProtocolRow[];
  checkins: CheckinRow[];
  lapses: LapseRow[];
}> {
  const supabase = getServiceClient();
  const filterFor = (q: ReturnType<typeof supabase.from>) => {
    if (owner.kind === "user") return q.eq("user_id", owner.userId);
    return q.eq("session_token", owner.sessionToken).is("user_id", null);
  };

  const [qr, pr, cr, lr] = await Promise.all([
    filterFor(supabase.from("quiz_responses").select("*")),
    filterFor(supabase.from("protocols").select("*")),
    filterFor(supabase.from("checkins").select("*")),
    filterFor(supabase.from("lapses").select("*")),
  ]);

  if (qr.error) throw new Error(qr.error.message);
  if (pr.error) throw new Error(pr.error.message);
  if (cr.error) throw new Error(cr.error.message);
  if (lr.error) throw new Error(lr.error.message);

  return {
    quiz_responses: qr.data ?? [],
    protocols: pr.data ?? [],
    checkins: cr.data ?? [],
    lapses: lr.data ?? [],
  };
}

/* ============================================
 * WIPE — destructive: delete all rows for an owner
 * ============================================ */
export async function wipeOwnerData(owner: Owner): Promise<void> {
  const supabase = getServiceClient();
  const filterFor = (q: ReturnType<typeof supabase.from>) => {
    if (owner.kind === "user") return q.eq("user_id", owner.userId);
    return q.eq("session_token", owner.sessionToken).is("user_id", null);
  };

  // FK-safe order: lapses → checkins → protocols → quiz_responses
  const l = await filterFor(supabase.from("lapses").delete());
  if (l.error) throw new Error(`Wipe lapses: ${l.error.message}`);

  const c = await filterFor(supabase.from("checkins").delete());
  if (c.error) throw new Error(`Wipe checkins: ${c.error.message}`);

  const p = await filterFor(supabase.from("protocols").delete());
  if (p.error) throw new Error(`Wipe protocols: ${p.error.message}`);

  const qr = await filterFor(supabase.from("quiz_responses").delete());
  if (qr.error) throw new Error(`Wipe quiz_responses: ${qr.error.message}`);
}
