"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Check, Sunrise, Sun, Sunset, Moon } from "lucide-react";
import { cn } from "@/lib/cn";
import type { NonNegotiable } from "@/lib/protocol/types";

const TIME_ORDER = ["morning", "midday", "evening", "night"] as const;
type TimeOfDay = (typeof TIME_ORDER)[number];

const TIME_META: Record<
  TimeOfDay,
  { label: string; icon: typeof Sunrise }
> = {
  morning: { label: "Morning", icon: Sunrise },
  midday: { label: "Midday", icon: Sun },
  evening: { label: "Evening", icon: Sunset },
  night: { label: "Night", icon: Moon },
};

/**
 * TodayCheckIn — daily non-negotiables, grouped by time-of-day. Toggling
 * a row optimistically updates state and POSTs to /api/checkins.
 *
 * Per CLAUDE.md: no celebration animation, no streak counters. The
 * strongest visual feedback is a quiet color shift + checkmark.
 */
export function TodayCheckIn({
  protocolId,
  date,
  nonNegotiables,
  initialCompleted,
}: {
  protocolId: string;
  date: string;
  nonNegotiables: NonNegotiable[];
  initialCompleted: string[];
}) {
  const [committed, setCommitted] = useState<string[]>(initialCompleted);
  const [optimistic, applyOptimistic] = useOptimistic<
    string[],
    { id: string; checked: boolean }
  >(committed, (state, action) => {
    if (action.checked) return state.includes(action.id) ? state : [...state, action.id];
    return state.filter((x) => x !== action.id);
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const toggle = (id: string) => {
    setError(null);
    const next = optimistic.includes(id)
      ? optimistic.filter((x) => x !== id)
      : [...optimistic, id];

    startTransition(async () => {
      applyOptimistic({ id, checked: !optimistic.includes(id) });
      try {
        const res = await fetch("/api/checkins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ protocolId, date, completedItems: next }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to save");
        }
        setCommitted(next);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't save. Try again.");
      }
    });
  };

  // Group non-negotiables by time-of-day, preserving original ordering inside groups.
  const grouped = TIME_ORDER.map((slot) => ({
    slot,
    items: nonNegotiables.filter((nn) => nn.time_of_day === slot),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-9 md:space-y-10">
      {grouped.map(({ slot, items }) => {
        const meta = TIME_META[slot];
        const Icon = meta.icon;
        return (
          <div key={slot} className="space-y-3">
            <div className="flex items-center gap-2.5 px-1">
              <Icon
                size={13}
                strokeWidth={1.5}
                className="text-[var(--accent-base)]"
              />
              <span className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--text-tertiary)]">
                {meta.label}
              </span>
              <div className="flex-1 h-px bg-[var(--border-subtle)]" />
              <span className="font-mono text-[0.6875rem] tabular-nums text-[var(--text-tertiary)]">
                {items.filter((nn) => optimistic.includes(nn.id)).length} / {items.length}
              </span>
            </div>
            <div className="space-y-2">
              {items.map((nn) => (
                <Row
                  key={nn.id}
                  nn={nn}
                  done={optimistic.includes(nn.id)}
                  onToggle={() => toggle(nn.id)}
                  disabled={isPending}
                />
              ))}
            </div>
          </div>
        );
      })}

      {error ? (
        <p className="font-sans text-[0.875rem] text-[var(--state-danger)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Row({
  nn,
  done,
  onToggle,
  disabled,
}: {
  nn: NonNegotiable;
  done: boolean;
  onToggle: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "group w-full text-left rounded-[8px] border transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-canvas)]",
        done
          ? "bg-[var(--accent-muted)]/40 border-[var(--accent-base)]/45"
          : "bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)]"
      )}
    >
      <div className="px-5 py-4 md:px-6 md:py-4 flex items-start gap-4">
        <div
          className={cn(
            "shrink-0 mt-1 w-5 h-5 rounded-[5px] border flex items-center justify-center transition-colors duration-150",
            done
              ? "bg-[var(--accent-base)] border-[var(--accent-base)]"
              : "border-[var(--border-default)] group-hover:border-[var(--text-secondary)]"
          )}
        >
          {done ? (
            <Check
              size={13}
              strokeWidth={2.5}
              className="text-[var(--text-primary)]"
            />
          ) : null}
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div
            className={cn(
              "font-serif text-[1.0625rem] md:text-[1.125rem] leading-[1.35] tracking-[-0.005em]",
              done
                ? "text-[var(--text-secondary)] line-through decoration-[var(--accent-base)]/50 decoration-1"
                : "text-[var(--text-primary)]"
            )}
          >
            {nn.title}
          </div>
          <div
            className={cn(
              "font-sans italic text-[0.875rem] leading-[1.5]",
              done
                ? "text-[var(--text-tertiary)]"
                : "text-[var(--text-secondary)]"
            )}
          >
            {nn.tiny_action}
          </div>
        </div>
      </div>
    </button>
  );
}
