"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Milestone } from "@/lib/milestones";

/**
 * Full-viewport one-time interstitial. Shown once per milestone day per
 * protocol. Calm — no celebration animation, no confetti.
 */
export function MilestoneOverlay({
  milestone,
  protocolId,
}: {
  milestone: Milestone;
  protocolId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [isPending, startTransition] = useTransition();

  const dismiss = () => {
    startTransition(async () => {
      try {
        await fetch("/api/milestone/seen", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ protocolId, day: milestone.day }),
        });
      } catch {
        // soft fail — user can still re-see this on next visit
      }
      setOpen(false);
      router.refresh();
    });
  };

  // Esc to dismiss (also marks as seen — same as button)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="milestone-title"
      className="fixed inset-0 z-[60] bg-[var(--bg-canvas)]/97 backdrop-blur-md flex items-center justify-center px-6"
    >
      {/* Soft oxblood ambient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[1100px] max-h-[1100px] rounded-full opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(122,31,36,0.35) 0%, rgba(122,31,36,0.1) 40%, transparent 70%)",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-base)]/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-base)]/30 to-transparent" />
      </div>

      <div className="relative max-w-[640px] w-full">
        <div className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--accent-base)] mb-5">
          {milestone.kicker}
        </div>
        <h1 id="milestone-title" className="font-serif text-[2rem] md:text-[2.625rem] leading-[1.08] tracking-[-0.02em] text-[var(--text-primary)] mb-6">
          {milestone.title}
        </h1>
        <p className="font-sans text-[1rem] md:text-[1.125rem] leading-[1.7] text-[var(--text-secondary)] max-w-prose mb-9">
          {milestone.body}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={dismiss}
            disabled={isPending}
            className="inline-flex items-center gap-2 h-12 px-7 rounded-[6px] bg-[var(--accent-base)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] font-mono text-[0.6875rem] tracking-[0.22em] uppercase disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-canvas)]"
          >
            {isPending ? "Saving…" : milestone.cta}
          </button>
        </div>
      </div>
    </div>
  );
}
