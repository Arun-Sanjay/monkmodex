/**
 * POST /api/diagnosis
 *
 * Receives quiz responses, scores them, persists a quiz_responses row,
 * generates the AI diagnosis via Anthropic (cached system prompt), saves
 * the diagnosis text, and returns the response id so the client can
 * navigate to /diagnostic/results/[id].
 *
 * No streaming yet — the response is short (~280 words) and a loading
 * screen on the client handles the ~10–15s generation. Streaming SSE can
 * be added later; the SDK call site uses .stream() + .finalMessage()
 * already so it's a small change.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateSessionToken } from "@/services/session";
import { scoreQuiz } from "@/lib/quiz/scoring";
import { insertQuizResponse, setDiagnosisData } from "@/services/supabase/queries";
import { generateDiagnosisData } from "@/services/anthropic/generate-diagnosis";

export const runtime = "nodejs";
export const maxDuration = 60;

const RequestSchema = z.object({
  responses: z.record(z.string(), z.unknown()),
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

  const responses = parsed.data.responses as Record<string, unknown>;

  // Score the quiz (pure logic — no IO, no errors expected).
  // Note: scoreQuiz expects QuizResponses; the runtime shape matches since
  // the client mirrors lib/quiz/schema field names.
  const scoring = scoreQuiz(responses as Parameters<typeof scoreQuiz>[0]);

  const sessionToken = await getOrCreateSessionToken();

  // 1. Persist the quiz response with flags (no diagnosis yet).
  const row = await insertQuizResponse({
    sessionToken,
    responses,
    flags: {
      severeAud: scoring.flags.severeAud,
      edHistory: scoring.flags.edHistory,
      phq2High: scoring.flags.phq2High,
      gad2High: scoring.flags.gad2High,
    },
    primaryCut: scoring.primaryCut,
    secondaryCuts: scoring.secondaryCuts,
    identityStatement:
      typeof responses.q18 === "string" ? responses.q18 : null,
  });

  // 2. Generate the structured diagnosis (prose + headline + pull_quotes +
  //    citations). The model returns a single JSON object validated by Zod
  //    inside generateDiagnosisData().
  let diagnosisData: Awaited<ReturnType<typeof generateDiagnosisData>>;
  try {
    diagnosisData = await generateDiagnosisData({
      responses:
        responses as Parameters<typeof generateDiagnosisData>[0]["responses"],
      scoring,
    });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? e.message
            : "Failed to generate diagnosis. Please try again.",
        responseId: row.id,
      },
      { status: 500 }
    );
  }

  // 3. Save both the structured payload and the plain prose for backward
  //    compatibility (the dashboard's old fallback path reads diagnosis_text).
  await setDiagnosisData(row.id, diagnosisData);

  return NextResponse.json({ responseId: row.id });
}
