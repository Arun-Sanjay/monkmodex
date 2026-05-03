"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export interface LoadingStage {
  /** When (in seconds since loader mount) this stage becomes the active one. */
  at: number;
  /** Visible text for this stage. */
  text: string;
}

/**
 * GenerationLoader — full-viewport ceremony for long-running AI calls.
 * Shows a kicker (top-mono), an oxblood "thinking" indicator, and a
 * stage-driven message that fades through the personalized phases of
 * generation. The pause IS the ceremony — it signals "this is being made
 * for you," not "the server is just slow."
 *
 * Stages are advanced by elapsed time, not by API progress; we don't have
 * granular signals from Anthropic during streaming. Tune the timings to
 * match the real generation latency for each call type.
 */
export function GenerationLoader({
  kicker,
  title,
  stages,
  fullscreen = true,
}: {
  kicker: string;
  title: string;
  stages: LoadingStage[];
  fullscreen?: boolean;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const t = setInterval(() => {
      setElapsed((Date.now() - start) / 1000);
    }, 250);
    return () => clearInterval(t);
  }, []);

  // Pick the latest stage whose `at` has passed.
  const activeIdx = (() => {
    let idx = 0;
    for (let i = 0; i < stages.length; i++) {
      if (elapsed >= stages[i].at) idx = i;
    }
    return idx;
  })();

  return (
    <div
      className={cn(
        fullscreen
          ? "fixed inset-0 z-[60] bg-[var(--bg-canvas)]/96 backdrop-blur-md"
          : "relative w-full",
        "flex items-center justify-center px-6"
      )}
    >
      {/* Soft oxblood ambient — slow pulse */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[1100px] max-h-[1100px] rounded-full opacity-[0.32] blur-3xl animate-[gen-loader-pulse_6s_ease-in-out_infinite]"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(122,31,36,0.28) 0%, rgba(122,31,36,0.12) 38%, rgba(0,0,0,0) 70%)",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-base)]/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-base)]/30 to-transparent" />
      </div>

      <div className="relative max-w-[640px] w-full">
        {/* Top kicker */}
        <div className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--accent-base)] mb-5 flex items-center gap-2">
          <span
            aria-hidden
            className="w-1.5 h-1.5 rounded-full bg-[var(--accent-base)] animate-pulse"
          />
          {kicker}
        </div>

        {/* Title */}
        <h2 className="font-serif text-[1.625rem] md:text-[2.125rem] leading-[1.15] tracking-[-0.018em] text-[var(--text-primary)] mb-9 md:mb-11">
          {title}
        </h2>

        {/* Stage carousel — keyed transitions */}
        <div className="relative h-[3.5rem] md:h-[3rem]">
          {stages.map((stage, i) => (
            <p
              key={i}
              className={cn(
                "absolute inset-0 font-sans text-[1.0625rem] md:text-[1.125rem] leading-[1.55] text-[var(--text-secondary)] transition-opacity duration-700 ease-in-out",
                i === activeIdx ? "opacity-100" : "opacity-0"
              )}
              aria-hidden={i !== activeIdx}
            >
              <span className="text-[var(--text-primary)]">{stage.text}</span>
            </p>
          ))}
        </div>

        {/* Indeterminate bar */}
        <div className="mt-10 h-[2px] rounded-full bg-[var(--border-subtle)] overflow-hidden">
          <div className="h-full w-1/3 rounded-full bg-[var(--accent-base)] animate-[gen-loader-slide_2.6s_ease-in-out_infinite]" />
        </div>

        {/* Whisper line — calms the wait */}
        <p className="mt-7 font-sans italic text-[0.875rem] leading-[1.6] text-[var(--text-tertiary)]">
          Take a breath. The pause is the ceremony.
        </p>
      </div>

      {/* Keyframes are scoped here for portability */}
      <style jsx global>{`
        @keyframes gen-loader-pulse {
          0%,
          100% {
            transform: translate(-50%, -50%) scale(0.96);
            opacity: 0.28;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.04);
            opacity: 0.4;
          }
        }
        @keyframes gen-loader-slide {
          0% {
            transform: translateX(-110%);
          }
          50% {
            transform: translateX(190%);
          }
          100% {
            transform: translateX(-110%);
          }
        }
      `}</style>
    </div>
  );
}

/* ---------- Pre-defined stage scripts ---------- */

export const DIAGNOSIS_STAGES: LoadingStage[] = [
  { at: 0, text: "Reading your responses." },
  { at: 2.5, text: "Cross-referencing forty years of addiction research." },
  { at: 5, text: "Identifying what's specifically dysregulated." },
  { at: 8, text: "Selecting the relevant mechanisms to cite." },
  { at: 11, text: "Writing your diagnosis." },
  { at: 15, text: "Reviewing the read once more before sending." },
  { at: 22, text: "Final pass — naming the dominant variable." },
];

export const PROTOCOL_STAGES: LoadingStage[] = [
  { at: 0, text: "Re-reading your diagnosis." },
  { at: 3, text: "Cross-referencing the routines you already have." },
  { at: 6, text: "Selecting your primary cut, by Lembke's principle." },
  { at: 9, text: "Building self-binding strategies that don't rely on willpower." },
  { at: 13, text: "Writing if-then triggers for your specific high-risk moments." },
  { at: 17, text: "Anchoring each non-negotiable to an existing routine." },
  { at: 21, text: "Constructing your phase progression." },
  { at: 26, text: "Calibrating expectations for days one through fourteen." },
  { at: 32, text: "Finalizing your protocol." },
  { at: 40, text: "Almost there — last sanity pass." },
];
