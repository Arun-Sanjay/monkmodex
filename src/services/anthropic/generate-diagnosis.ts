/**
 * Diagnosis generation — streamed Anthropic call returning structured
 * output (prose + headline + pull_quotes + citations).
 *
 * The system prompt is cached via prompt caching (cache_control: ephemeral)
 * since it's shared across all diagnosis + protocol calls. Per-user content
 * lives in the user message so the prefix stays stable.
 */

import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient, DEFAULT_MODEL } from "./client";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts/system";
import { buildDiagnosisUserMessage } from "@/lib/ai/prompts/diagnosis";
import type { QuizResponses } from "@/lib/quiz/schema";
import type { ScoringOutput } from "@/lib/quiz/scoring";
import type { DiagnosisData } from "@/services/supabase/types";

const CitationSchema = z.object({
  id: z.number().int(),
  author: z.string().min(1),
  year: z.number().int(),
  title: z.string().min(1),
  journal: z.string().nullable().optional(),
  finding: z.string().nullable().optional(),
});

const DiagnosisDataSchema = z.object({
  headline: z.string().min(1),
  prose: z.string().min(1),
  pull_quotes: z.array(z.string().min(1)),
  citations: z.array(CitationSchema),
});

/**
 * Returns the streaming MessageStream so the API route can pipe deltas to
 * the client SSE if desired. The route uses .finalMessage() to get the
 * complete text for parsing.
 */
export function streamDiagnosis(input: {
  responses: QuizResponses;
  scoring: ScoringOutput;
}): ReturnType<Anthropic["messages"]["stream"]> {
  const client = getAnthropicClient();
  return client.messages.stream({
    model: DEFAULT_MODEL,
    max_tokens: 3072,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: buildDiagnosisUserMessage(input.responses, input.scoring),
      },
    ],
  });
}

/**
 * High-level helper: generate, parse, validate. Returns the structured
 * DiagnosisData on success or throws.
 */
export async function generateDiagnosisData(input: {
  responses: QuizResponses;
  scoring: ScoringOutput;
}): Promise<DiagnosisData> {
  const stream = streamDiagnosis(input);
  const finalMessage = await stream.finalMessage();

  let text = "";
  for (const block of finalMessage.content) {
    if (block.type === "text") text += block.text;
  }

  if (!text.trim()) {
    throw new Error("Anthropic returned empty content for diagnosis");
  }

  const jsonText = extractJsonObject(text);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error(
      `Diagnosis returned non-JSON:\n${jsonText.slice(0, 400)}`
    );
  }

  const validated = DiagnosisDataSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(`Diagnosis failed Zod validation: ${validated.error.message}`);
  }

  return validated.data;
}

/**
 * Extract the outermost JSON object from a model response. Handles
 * code-fence wrapping and prose before/after.
 */
function extractJsonObject(raw: string): string {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const candidate = fenceMatch ? fenceMatch[1].trim() : trimmed;

  const start = candidate.indexOf("{");
  if (start === -1) return candidate;

  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < candidate.length; i++) {
    const c = candidate[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (c === "\\" && inString) {
      escape = true;
      continue;
    }
    if (c === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return candidate.slice(start, i + 1);
    }
  }
  return candidate.slice(start);
}
