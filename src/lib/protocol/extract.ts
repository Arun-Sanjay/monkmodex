/**
 * Protocol data accessors. The Protocol jsonb is validated at write-time;
 * at read-time we use Zod's .safeParse to defensively unwrap into typed
 * structures, falling back to empty defaults if the row is from an older
 * schema version.
 */

import { ProtocolSchema, type Protocol } from "./types";

export function parseProtocolData(raw: unknown): Protocol | null {
  const result = ProtocolSchema.safeParse(raw);
  if (!result.success) return null;
  return result.data;
}

export function formatAnchor(anchor: string): string {
  return anchor.replace(/_/g, " ").trim();
}
