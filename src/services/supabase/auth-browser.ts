/**
 * Browser-side Supabase auth client. Used from `"use client"` components
 * for sign-in (sendOtp), sign-out, and reactive auth state. Never uses
 * the service-role key.
 */

"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";
import type { SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient<Database> | null = null;

export function getBrowserClient(): SupabaseClient<Database> {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  cached = createBrowserClient<Database>(url, anonKey);
  return cached;
}
