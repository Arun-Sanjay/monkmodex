/**
 * DailyBriefing — rule-based, server-rendered, calm.
 * Sits between the hero and the non-negotiables section on Today.
 */

import { Lock } from "lucide-react";

export function DailyBriefing({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="flex items-start gap-3 px-1">
      <Lock
        size={11}
        strokeWidth={2}
        className="mt-1.5 text-[var(--accent-base)] shrink-0"
        aria-hidden
      />
      <p className="font-sans italic text-[0.9375rem] md:text-[1rem] leading-[1.6] text-[var(--text-secondary)] max-w-2xl">
        {text}
      </p>
    </div>
  );
}
