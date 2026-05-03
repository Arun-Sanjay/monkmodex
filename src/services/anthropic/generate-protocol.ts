/**
 * Protocol generation — instructs Claude to return a JSON object matching
 * the Protocol shape, then validates with Zod before persisting.
 *
 * We don't use Anthropic structured outputs here because the protocol
 * schema is too deeply nested for the strict-mode grammar compiler ("the
 * compiled grammar is too large"). The prompt describes the shape in
 * detail and Zod safeParse catches anything malformed at the boundary.
 */

import { getAnthropicClient, DEFAULT_MODEL } from "./client";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts/system";
import { buildProtocolUserMessage } from "@/lib/ai/prompts/protocol";
import { ProtocolSchema, type Protocol } from "@/lib/protocol/types";
import type { QuizResponses } from "@/lib/quiz/schema";
import type { ScoringOutput } from "@/lib/quiz/scoring";
import type { Tier } from "@/lib/constants";

export async function generateProtocol(input: {
  responses: QuizResponses;
  scoring: ScoringOutput;
  diagnosis: string;
  tier: Tier;
}): Promise<Protocol> {
  const client = getAnthropicClient();

  // Stream — large protocols risk HTTP timeouts otherwise.
  const stream = client.messages.stream({
    model: DEFAULT_MODEL,
    max_tokens: 8192,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: buildProtocolUserMessage(input) }],
  });

  const finalMessage = await stream.finalMessage();

  let text = "";
  for (const block of finalMessage.content) {
    if (block.type === "text") text += block.text;
  }

  if (!text.trim()) {
    throw new Error("Anthropic returned empty content for protocol generation");
  }

  // Strip any markdown code fences and grab the outermost JSON object.
  const jsonText = extractJsonObject(text);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error(
      `Anthropic returned non-JSON for protocol:\n${jsonText.slice(0, 400)}`
    );
  }

  const validated = ProtocolSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(
      `Protocol failed Zod validation: ${validated.error.message}`
    );
  }

  return sanitizeProtocol(validated.data);
}

/**
 * Post-process safety net for AI output. Even with explicit prompt rules,
 * the model occasionally still includes frequency suffixes ("7 days a
 * week") or snake_case anchors ("morning_coffee"). We strip those at the
 * boundary so storage and UI stay clean.
 */
function sanitizeProtocol(p: Protocol): Protocol {
  return {
    ...p,
    non_negotiables: p.non_negotiables.map((nn) => ({
      ...nn,
      title: sanitizeTitle(nn.title),
      anchor: normalizeAnchor(nn.anchor),
    })),
  };
}

function sanitizeTitle(raw: string): string {
  let s = raw.trim();

  // Trailing frequency suffixes after a comma.
  s = s.replace(
    /,\s*\d+\s*(?:days?|times?)\s*(?:a|per)\s*week\s*$/i,
    ""
  );
  s = s.replace(/,\s*\d+\s*\/\s*week\s*$/i, "");
  s = s.replace(
    /,\s*(?:every\s*(?:single\s*)?day|each\s*day|daily|always|consistently|without\s*fail)\s*$/i,
    ""
  );
  s = s.replace(/,\s*every\s*(?:morning|evening|night|afternoon)\s*$/i, "");

  // Trailing frequency phrases without a comma.
  s = s.replace(
    /\s+\d+\s*(?:days?|times?)\s*(?:a|per)\s*week\s*$/i,
    ""
  );
  s = s.replace(
    /\s+(?:every\s*(?:single\s*)?day|each\s*day|daily|always|consistently|without\s*fail)\s*$/i,
    ""
  );
  s = s.replace(/\s+every\s*(?:morning|evening|night|afternoon)\s*$/i, "");

  // Leading frequency adjectives.
  s = s.replace(/^(?:daily|always|consistently)\s+/i, "");
  s = s.replace(/^each\s+day\s+/i, "");
  s = s.replace(/^every\s+(?:single\s+)?day\s+/i, "");

  s = s.trim();
  if (s.length > 0) {
    s = s[0].toUpperCase() + s.slice(1);
  }
  return s;
}

function normalizeAnchor(raw: string): string {
  return raw.replace(/_/g, " ").trim().toLowerCase();
}

/**
 * Extract the outermost JSON object from a model response. Handles:
 *   - clean responses that already start with `{` and end with `}`
 *   - responses wrapped in ```json ... ``` or ``` ... ``` fences
 *   - responses with prose before/after the JSON
 */
function extractJsonObject(raw: string): string {
  const trimmed = raw.trim();

  // Strip markdown code fence if present.
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const candidate = fenceMatch ? fenceMatch[1].trim() : trimmed;

  // Find the outermost { ... } by scanning for matching braces (string-aware).
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
