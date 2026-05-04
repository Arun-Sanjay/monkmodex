/**
 * Auth-aware Supabase server client. Reads / writes the auth session
 * cookies via Next's cookies() API. Use this whenever you need to know
 * who the current user is (anonymous vs. authed).
 *
 * Distinct from the service-role client in `server.ts`, which bypasses
 * RLS and is only used for trusted writes from API routes.
 */

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "./types";

export async function getAuthClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server components can't set cookies — this throw is fine; the
          // middleware/route handler that needed to write will have done so.
        }
      },
    },
  });
}

/**
 * Returns { user, userId } for the current request, or null if anonymous.
 * Cheap — reads from the cookie-bound JWT, no network call.
 */
export async function getAuthUser(): Promise<{
  userId: string;
  email: string | null;
} | null> {
  const supabase = await getAuthClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return { userId: data.user.id, email: data.user.email ?? null };
}
