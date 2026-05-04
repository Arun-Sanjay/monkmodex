/**
 * Owner — the identity of "who this data belongs to". Two shapes:
 *
 *   - { kind: "user", userId }       — authenticated user
 *   - { kind: "session", sessionToken } — anonymous browser-cookie session
 *
 * Every query in `services/supabase/queries.ts` takes an Owner and filters
 * by either `user_id` (when authed) or `session_token AND user_id IS NULL`
 * (when anonymous). This keeps the two worlds cleanly separated:
 *
 *   - An authed user never sees anonymous rows that haven't been claimed.
 *   - An anonymous user never sees rows that were claimed by an authed
 *     user (even if the cookie technically still matches).
 *
 * The transition happens via the claim flow at /auth/claim.
 */

import { getAuthUser } from "./supabase/auth-server";
import { getSessionToken, getOrCreateSessionToken } from "./session";

export type Owner =
  | { kind: "user"; userId: string }
  | { kind: "session"; sessionToken: string };

/**
 * Read the request's owner. Prefers authed user; falls back to session
 * cookie. Returns null if neither is present (i.e. brand-new visitor with
 * no session cookie yet — typically only true mid-quiz before the first
 * insert).
 */
export async function resolveOwner(): Promise<Owner | null> {
  const user = await getAuthUser();
  if (user) return { kind: "user", userId: user.userId };
  const sessionToken = await getSessionToken();
  if (sessionToken) return { kind: "session", sessionToken };
  return null;
}

/**
 * Read-or-create variant. Used by /api/diagnosis on the very first POST
 * to ensure an anonymous visitor gets a session cookie minted before we
 * write the row. If the user is authed, just returns the user owner.
 */
export async function resolveOrCreateOwner(): Promise<Owner> {
  const user = await getAuthUser();
  if (user) return { kind: "user", userId: user.userId };
  const sessionToken = await getOrCreateSessionToken();
  return { kind: "session", sessionToken };
}

export function isUserOwner(o: Owner): o is { kind: "user"; userId: string } {
  return o.kind === "user";
}
