/**
 * POST /auth/sign-out
 *
 * Clears the Supabase auth session via @supabase/ssr (which handles the
 * cookie write through getAuthClient's cookie adapter), then redirects
 * to the homepage.
 */

import { NextResponse, type NextRequest } from "next/server";
import { getAuthClient } from "@/services/supabase/auth-server";

export async function POST(req: NextRequest) {
  const supabase = await getAuthClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", req.url), { status: 303 });
}
