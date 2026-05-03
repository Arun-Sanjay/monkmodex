/**
 * POST /api/diagnosis/regenerate
 *
 * Re-runs the diagnosis generator for an existing quiz response and
 * overwrites diagnosis_text + diagnosis_data with the fresh structured
 * output. Useful when the prompt or schema is updated and existing rows
 * need to be brought up to date.
 *
 * Auth: requires the request's session_token cookie to match the
 * quiz_response.session_token. Returns 403 otherwise.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionToken } from "@/services/session";
import { scoreQuiz } from "@/lib/quiz/scoring";
import {
  getQuizResponseById,
  setDiagnosisData,
} from "@/services/supabase/queries";
import { generateDiagnosisData } from "@/services/anthropic/generate-diagnosis";
import type { QuizResponses } from "@/lib/quiz/schema";

export const runtime = "nodejs";
export const maxDuration = 60;

const RequestSchema = z.object({
  responseId: z.string().uuid(),
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
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  const row = await getQuizResponseById(parsed.data.responseId);
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (row.session_token !== sessionToken) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const scoring = scoreQuiz(row.responses as QuizResponses);

  let data: Awaited<ReturnType<typeof generateDiagnosisData>>;
  try {
    data = await generateDiagnosisData({
      responses: row.responses as QuizResponses,
      scoring,
    });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? e.message
            : "Failed to regenerate diagnosis",
      },
      { status: 502 }
    );
  }

  await setDiagnosisData(row.id, data);

  return NextResponse.json({
    ok: true,
    responseId: row.id,
    citations: data.citations.length,
    pull_quotes: data.pull_quotes.length,
  });
}
