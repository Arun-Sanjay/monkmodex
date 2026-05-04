/**
 * POST /api/lapses
 *
 * Logs a lapse. Returns the created row + a Marlatt-grounded one-liner
 * the client renders inline so the user has language to use immediately.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveOwner } from "@/services/owner";
import { getSessionToken } from "@/services/session";
import { getActiveProtocol, insertLapse } from "@/services/supabase/queries";

export const runtime = "nodejs";

const RequestSchema = z.object({
  protocolId: z.string().uuid(),
  cutTarget: z.string().min(1).max(120),
  trigger: z.string().max(500).optional(),
  thirtyMinBefore: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
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

  const sessionToken =
    (await getSessionToken()) ??
    (owner.kind === "session" ? owner.sessionToken : "");

  const protocol = await getActiveProtocol(owner);
  if (!protocol || protocol.id !== parsed.data.protocolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const row = await insertLapse({
    owner,
    sessionToken: sessionToken || protocol.session_token,
    protocolId: parsed.data.protocolId,
    cutTarget: parsed.data.cutTarget,
    trigger: parsed.data.trigger ?? null,
    thirtyMinBefore: parsed.data.thirtyMinBefore ?? null,
    notes: parsed.data.notes ?? null,
  });

  return NextResponse.json({
    ok: true,
    lapse: row,
    response:
      "Logged. Marlatt's data: a single lapse predicts full relapse only when interpreted as identity collapse — not when treated as situational data. The streak resets; the protocol does not. Sleep and the substrate matter twice as much tonight.",
  });
}
