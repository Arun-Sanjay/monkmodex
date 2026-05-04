/**
 * POST /api/protocol
 *
 * The "unlock" endpoint. Replaces the Lemon Squeezy webhook in dev mode —
 * any authenticated session (i.e. the one that owns the quiz_response) can
 * trigger protocol generation by hitting this with { responseId, tier }.
 *
 * In the shippable version this becomes the webhook handler called by
 * Lemon Squeezy on `order_created`.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionToken } from "@/services/session";
import { resolveOwner } from "@/services/owner";
import { scoreQuiz } from "@/lib/quiz/scoring";
import { generateProtocol } from "@/services/anthropic/generate-protocol";
import {
  getQuizResponseById,
  insertProtocol,
  setUnlockTier,
  getProtocolByQuizResponseId,
} from "@/services/supabase/queries";
import { TIER_DURATION_DAYS } from "@/lib/constants";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { getAuthUser } from "@/services/supabase/auth-server";
import { sendEmail } from "@/services/email/resend";
import { orderConfirmation } from "@/services/email/templates";
import type { QuizResponses } from "@/lib/quiz/schema";

export const runtime = "nodejs";
export const maxDuration = 120;

const RequestSchema = z.object({
  responseId: z.string().uuid(),
  tier: z.enum(["foundation", "operator"]),
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
      { error: "Invalid request shape" },
      { status: 400 }
    );
  }

  const { responseId, tier } = parsed.data;

  // Rate limit: 5 protocol generations per IP per day. With idempotency
  // already enforced per-response, this caps abuse via fresh quizzes.
  const ip = clientIp(req);
  const rl = await rateLimit({
    key: `proto:ip:${ip}`,
    max: 5,
    windowSec: 86400,
  });
  if (!rl.ok) {
    return NextResponse.json(
      {
        error:
          "Protocol generation limit reached for this device. Try again tomorrow.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.ceil((rl.resetAt.getTime() - Date.now()) / 1000)
          ),
        },
      }
    );
  }

  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  const row = await getQuizResponseById(responseId);
  if (!row) {
    return NextResponse.json({ error: "Quiz response not found" }, { status: 404 });
  }
  if (row.session_token !== sessionToken) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!row.diagnosis_text) {
    return NextResponse.json(
      { error: "Diagnosis not yet generated" },
      { status: 409 }
    );
  }

  // Idempotency: if a protocol already exists for this quiz response, no-op.
  const existing = await getProtocolByQuizResponseId(responseId);
  if (existing) {
    return NextResponse.json({
      ok: true,
      protocolId: existing.id,
      deduplicated: true,
    });
  }

  // Re-score the saved responses (cheap, pure).
  const scoring = scoreQuiz(row.responses as QuizResponses);

  // Generate the protocol via Anthropic structured outputs.
  let protocol;
  try {
    protocol = await generateProtocol({
      responses: row.responses as QuizResponses,
      scoring,
      diagnosis: row.diagnosis_text,
      tier,
    });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? e.message
            : "Failed to generate protocol. Please try again.",
      },
      { status: 502 }
    );
  }

  const startDate = new Date().toISOString().split("T")[0];
  const owner = (await resolveOwner()) ?? { kind: "session" as const, sessionToken };

  const inserted = await insertProtocol({
    owner,
    sessionToken,
    quizResponseId: responseId,
    tier,
    durationDays: TIER_DURATION_DAYS[tier],
    protocolData: protocol as unknown as Record<string, unknown>,
    identityStatement: row.identity_statement,
    startDate,
  });

  await setUnlockTier(responseId, tier);

  // Fire-and-forget order confirmation if the user is authed and we have
  // an email. No-op when RESEND_API_KEY is missing.
  const authUser = await getAuthUser();
  if (authUser?.email) {
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const tmpl = orderConfirmation({
      email: authUser.email,
      tier,
      durationDays: TIER_DURATION_DAYS[tier],
      amountUsd: tier === "operator" ? 39 : 19,
      protocolUrl: `${appUrl}/dashboard`,
      diagnosisUrl: `${appUrl}/dashboard/diagnosis`,
    });
    void sendEmail({
      to: authUser.email,
      subject: tmpl.subject,
      html: tmpl.html,
      text: tmpl.text,
      category: "order_confirmation",
    }).catch((e) => console.error("order confirmation send failed:", e));
  }

  return NextResponse.json({
    ok: true,
    protocolId: inserted.id,
  });
}
