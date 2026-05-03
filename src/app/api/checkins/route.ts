/**
 * POST /api/checkins
 *
 * Upsert the user's daily check-in. Identified via session_token cookie.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionToken } from "@/services/session";
import {
  upsertCheckin,
  getActiveProtocol,
  getCheckinByDate,
} from "@/services/supabase/queries";

export const runtime = "nodejs";

// Both fields are optional so the client can patch one without clobbering
// the other. `null` on journalText explicitly clears it; omitting leaves
// the existing value alone.
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

  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  const protocol = await getActiveProtocol(sessionToken);
  if (!protocol || protocol.id !== parsed.data.protocolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await getCheckinByDate(sessionToken, parsed.data.date);
  const completedItems =
    parsed.data.completedItems ?? existing?.completed_items ?? [];
  const journalText =
    parsed.data.journalText !== undefined
      ? parsed.data.journalText
      : (existing?.journal_text ?? null);

  const row = await upsertCheckin({
    sessionToken,
    protocolId: parsed.data.protocolId,
    date: parsed.data.date,
    completedItems,
    journalText,
  });

  return NextResponse.json({ ok: true, checkin: row });
}
