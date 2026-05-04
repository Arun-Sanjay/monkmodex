/**
 * POST /api/auth/post-callback?next=...
 *
 * Called from the client-side CallbackHandler after the auth session is
 * established. Looks for orphaned anonymous data on this device. If
 * found, returns the claim URL; otherwise returns `next`.
 */

import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getAuthUser } from "@/services/supabase/auth-server";
import {
  getActiveProtocolBySession,
  getQuizResponsesBySession,
} from "@/services/supabase/queries";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const next = url.searchParams.get("next") ?? "/dashboard";

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ next: "/sign-in" });
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("mmx_session")?.value;
  if (!sessionToken) {
    return NextResponse.json({ next });
  }

  const protocol = await getActiveProtocolBySession(sessionToken);
  const responses = await getQuizResponsesBySession(sessionToken);
  const orphanedResponses = responses.filter((r) => r.user_id === null);
  const orphanedProtocol = protocol && protocol.user_id === null;

  if (orphanedProtocol || orphanedResponses.length > 0) {
    return NextResponse.json({
      next: `/auth/claim?next=${encodeURIComponent(next)}`,
    });
  }

  return NextResponse.json({ next });
}
