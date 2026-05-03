/**
 * Anthropic SDK client. Uses ANTHROPIC_API_KEY env var.
 *
 * No `react`/DOM imports here per CLAUDE.md portability rules.
 */

import Anthropic from "@anthropic-ai/sdk";

let cached: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (cached) return cached;
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "Missing ANTHROPIC_API_KEY. Set it in .env.local — get a key at https://console.anthropic.com/settings/keys"
    );
  }
  cached = new Anthropic();
  return cached;
}

/**
 * Default model. Override per-call by passing `model` explicitly, or
 * set ANTHROPIC_MODEL in .env.local to override globally.
 *
 * Per the claude-api skill: default to claude-opus-4-7 unless explicitly
 * told otherwise. Don't downgrade for cost — that's the user's choice.
 */
export const DEFAULT_MODEL =
  process.env.ANTHROPIC_MODEL ?? "claude-opus-4-7";
