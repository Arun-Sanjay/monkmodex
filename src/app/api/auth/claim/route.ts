/**
 * POST /api/auth/claim
 *
 * Atomically binds the orphaned anonymous rows on this device's session
 * cookie to the currently authed user. After this call:
 *   - quiz_responses, protocols, checkins with (session_token = X, user_id NULL)
 *     get user_id = current_user.
 *   - The session cookie is left in place (other devices may still want it
 *     for their own anon flows; ours is now claimed).
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthUser } from "@/services/supabase/auth-server";
import { claimSessionForUser } from "@/services/supabase/queries";

export const runtime = "nodejs";

export async function POST() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("mmx_session")?.value;
  if (!sessionToken) {
    return NextResponse.json({ ok: true, claimed: 0, note: "no session cookie" });
  }

  const result = await claimSessionForUser(sessionToken, user.userId);
  return NextResponse.json({ ok: true, ...result });
}
