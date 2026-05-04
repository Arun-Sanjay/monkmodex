/**
 * Resend client wrapper. Env-gated: when RESEND_API_KEY is missing, every
 * send is a no-op that returns ok-style result so callers don't need to
 * branch. Logs a debug line in dev so you know what would have been sent.
 */

import { Resend } from "resend";

let cachedClient: Resend | null = null;

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!cachedClient) cachedClient = new Resend(key);
  return cachedClient;
}

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "Monk ModeX <hello@monkmodex.com>";

export type SendResult =
  | { ok: true; id: string | null; skipped?: boolean }
  | { ok: false; error: string };

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
  /**
   * Optional Resend tag for quick filtering in their dashboard.
   * Use snake-case category names: order_confirmation, milestone_day_14, etc.
   */
  category?: string;
}): Promise<SendResult> {
  const client = getClient();
  if (!client) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[email] would send to ${input.to} (subject: "${input.subject}") — RESEND_API_KEY not set, skipping`
      );
    }
    return { ok: true, id: null, skipped: true };
  }

  try {
    const res = await client.emails.send({
      from: FROM_EMAIL,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      tags: input.category ? [{ name: "category", value: input.category }] : undefined,
    });
    if (res.error) {
      return { ok: false, error: res.error.message };
    }
    return { ok: true, id: res.data?.id ?? null };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "unknown send error",
    };
  }
}
