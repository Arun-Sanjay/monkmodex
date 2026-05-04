/**
 * POST /api/checkins
 *
 * Upsert the user's daily check-in. Identified by Owner — authed user_id
 * if signed in, otherwise the session_token cookie.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionToken } from "@/services/session";
import { resolveOwner } from "@/services/owner";
import {
  upsertCheckin,
  getActiveProtocol,
  getCheckinByDate,
} from "@/services/supabase/queries";

export const runtime = "nodejs";

const RequestSchema = z.object({
  protocolId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  completedItems: z.array(z.string()).optional(),
  journalText: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const owner = await resolveOwner();
  if (!owner) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  // We need a session_token for the row's NOT NULL column. If the user is
  // authed without a cookie (rare), this call mints one.
  const sessionToken =
    (await getSessionToken()) ??
    (owner.kind === "session" ? owner.sessionToken : "");

  const protocol = await getActiveProtocol(owner);
  if (!protocol || protocol.id !== parsed.data.protocolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await getCheckinByDate(owner, parsed.data.date);
  const completedItems =
    parsed.data.completedItems ?? existing?.completed_items ?? [];
  const journalText =
    parsed.data.journalText !== undefined
      ? parsed.data.journalText
      : (existing?.journal_text ?? null);

  const row = await upsertCheckin({
    owner,
    sessionToken: sessionToken || protocol.session_token,
    protocolId: parsed.data.protocolId,
    date: parsed.data.date,
    completedItems,
    journalText,
  });

  return NextResponse.json({ ok: true, checkin: row });
}
