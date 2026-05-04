/**
 * Postgres-backed sliding-window rate limiter.
 *
 * Each (key, windowSec) pair gets a row in `rate_limit_buckets`. We keep
 * a count of requests inside the current window. If the window has
 * expired by the time we look, we reset.
 *
 * Approximate semantics — fine for cost protection on AI endpoints.
 * Not suitable for ops where exactly-N-per-window is critical.
 *
 * Usage:
 *
 *   const r = await rateLimit({ key: `diag:ip:${ip}`, max: 3, windowSec: 86400 });
 *   if (!r.ok) return new Response("Too many", { status: 429 });
 */

import { getServiceClient } from "@/services/supabase/server";

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: Date;
};

export async function rateLimit(input: {
  key: string;
  max: number;
  windowSec: number;
}): Promise<RateLimitResult> {
  const supabase = getServiceClient();
  const now = new Date();

  // Read current bucket
  const existing = await supabase
    .from("rate_limit_buckets")
    .select("*")
    .eq("bucket_key", input.key)
    .maybeSingle();

  if (existing.error) {
    // Soft fail open — never block real users on a transient DB blip
    console.error("rate_limit read failed", existing.error);
    return { ok: true, remaining: input.max, resetAt: now };
  }

  let count = 0;
  let windowStart = now;
  if (existing.data) {
    const winStart = new Date(existing.data.window_start as string);
    const expired = now.getTime() - winStart.getTime() > input.windowSec * 1000;
    if (expired) {
      count = 0;
      windowStart = now;
    } else {
      count = existing.data.count as number;
      windowStart = winStart;
    }
  }

  if (count >= input.max) {
    const resetAt = new Date(windowStart.getTime() + input.windowSec * 1000);
    return { ok: false, remaining: 0, resetAt };
  }

  // Increment + upsert. Last-writer-wins is fine for our load.
  const newCount = count + 1;
  const upsert = await supabase
    .from("rate_limit_buckets")
    .upsert({
      bucket_key: input.key,
      count: newCount,
      window_start: windowStart.toISOString(),
    });
  if (upsert.error) {
    console.error("rate_limit write failed", upsert.error);
    // Fail open
    return {
      ok: true,
      remaining: Math.max(0, input.max - newCount),
      resetAt: new Date(windowStart.getTime() + input.windowSec * 1000),
    };
  }

  return {
    ok: true,
    remaining: Math.max(0, input.max - newCount),
    resetAt: new Date(windowStart.getTime() + input.windowSec * 1000),
  };
}

/** Pull the originating IP from common headers. Trust the first hop. */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}
