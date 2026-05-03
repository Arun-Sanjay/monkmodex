/**
 * Session token cookie helpers.
 *
 * In dev mode (no auth), every browser session gets a UUID stored in an
 * httpOnly cookie. All API routes read this cookie to identify the user.
 * When real auth is added later, swap this out for Supabase auth.uid().
 */

import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { SESSION_COOKIE_NAME, SESSION_COOKIE_MAX_AGE } from "@/lib/constants";

/**
 * Read the session token from cookies. Returns null if not set.
 */
export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE_NAME)?.value ?? null;
}

/**
 * Read the session token, creating one if missing.
 *
 * NOTE: Calling this writes a cookie via `cookies().set(...)`, which is only
 * legal during a Server Action or Route Handler — not in an RSC. From a page
 * component, use `getSessionToken()` and create-on-write at the API boundary.
 */
export async function getOrCreateSessionToken(): Promise<string> {
  const store = await cookies();
  const existing = store.get(SESSION_COOKIE_NAME)?.value;
  if (existing) return existing;

  const token = randomUUID();
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE,
  });
  return token;
}
