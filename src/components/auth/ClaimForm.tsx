"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export function ClaimForm({ next }: { next: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleClaim = () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/claim", { method: "POST" });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Couldn't link your data — try again.");
        }
        router.push(next);
        router.refresh();
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "Couldn't link your data — try again."
        );
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClaim}
        disabled={isPending}
        className="inline-flex items-center gap-2 h-12 px-6 rounded-[6px] bg-[var(--accent-base)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-canvas)]"
      >
        {isPending ? "Linking…" : "Link this data to my account"}
        <ArrowRight size={16} strokeWidth={2} />
      </button>
      {error ? (
        <p className="mt-3 font-sans text-[0.875rem] text-[var(--state-danger)]">
          {error}
        </p>
      ) : null}
    </>
  );
}
