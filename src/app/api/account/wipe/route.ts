/**
 * POST /api/account/wipe
 *
 * Destructive: deletes every row this owner holds (lapses, checkins,
 * protocols, quiz_responses). Must be POSTed with { confirm: "WIPE" }
 * to prevent accidental triggers.
 *
 * For authed users: signs them out after wipe so the next request is a
 * fresh slate.
 * For anonymous: clears the session_token cookie so the device gets a
 * new one on next visit.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { resolveOwner } from "@/services/owner";
import { wipeOwnerData } from "@/services/supabase/queries";
import { getAuthClient } from "@/services/supabase/auth-server";

export const runtime = "nodejs";

const RequestSchema = z.object({
  confirm: z.literal("WIPE"),
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
    return NextResponse.json(
      { error: "Confirmation phrase missing" },
      { status: 400 }
    );
  }

  const owner = await resolveOwner();
  if (!owner) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  await wipeOwnerData(owner);

  // Clean up identity afterwards
  if (owner.kind === "user") {
    const supabase = await getAuthClient();
    await supabase.auth.signOut();
  } else {
    const cookieStore = await cookies();
    cookieStore.delete("mmx_session");
  }

  return NextResponse.json({ ok: true });
}
