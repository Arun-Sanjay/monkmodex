"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { Meta, BodySm } from "@/components/shared/Type";
import {
  GenerationLoader,
  PROTOCOL_STAGES,
} from "@/components/shared/GenerationLoader";
import { cn } from "@/lib/cn";
import type { Tier } from "@/services/supabase/types";

export function UnlockButton({
  responseId,
  tier,
  title,
  duration,
  items,
  highlight,
}: {
  responseId: string;
  tier: Tier;
  title: string;
  duration: string;
  items: string[];
  highlight?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/protocol", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ responseId, tier }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to unlock");
        }
        router.push("/dashboard");
        router.refresh();
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Something went wrong. Try again."
        );
      }
    });
  };

  return (
    <>
      {pending ? (
        <GenerationLoader
          kicker={`Building your ${title.toLowerCase()} protocol`}
          title="Personalizing the next 30–90 days to your reward system."
          stages={PROTOCOL_STAGES}
        />
      ) : null}

      <div
        className={cn(
          "rounded-lg border p-7 md:p-8 flex flex-col",
          highlight
            ? "bg-[var(--bg-elevated)] border-[var(--accent-muted)]"
            : "bg-[var(--bg-surface)] border-[var(--border-subtle)]"
        )}
      >
        <div className="flex items-baseline justify-between mb-5 pb-5 border-b border-[var(--border-subtle)]">
          <span className="font-serif text-[1.5rem] text-[var(--text-primary)]">
            {title}
          </span>
          <Meta>{duration}</Meta>
        </div>
        <ul className="space-y-3 mb-7 flex-1">
          {items.map((item) => (
            <li key={item} className="flex gap-3 items-start">
              <Check
                size={16}
                strokeWidth={2}
                className={cn(
                  "mt-1 shrink-0",
                  highlight
                    ? "text-[var(--accent-base)]"
                    : "text-[var(--text-secondary)]"
                )}
              />
              <BodySm className="text-[var(--text-primary)]">{item}</BodySm>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={handleUnlock}
          disabled={pending}
          className={cn(
            "w-full inline-flex items-center justify-center gap-2 h-12 px-6 rounded-[6px] font-medium transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-canvas)]",
            highlight
              ? "bg-[var(--accent-base)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)]"
              : "bg-[var(--bg-elevated)] border border-[var(--border-default)] hover:border-[var(--border-strong)] text-[var(--text-primary)]"
          )}
        >
          Unlock {title}
          <ArrowRight size={16} />
        </button>
        {error ? (
          <p className="mt-3 text-[0.875rem] text-[var(--state-danger)]">
            {error}
          </p>
        ) : null}
      </div>
    </>
  );
}
