"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check } from "lucide-react";

/**
 * LapseLogger — discrete inline form that posts a lapse + renders a
 * Marlatt-grounded one-liner immediately. Designed to feel like data
 * capture, not confession.
 */
export function LapseLogger({
  protocolId,
  cutTarget,
}: {
  protocolId: string;
  cutTarget: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [trigger, setTrigger] = useState("");
  const [thirtyMinBefore, setThirtyMinBefore] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/lapses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            protocolId,
            cutTarget,
            trigger: trigger.trim() || undefined,
            thirtyMinBefore: thirtyMinBefore.trim() || undefined,
            notes: notes.trim() || undefined,
          }),
        });
        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || "Failed to log");
        }
        const data: { response?: string } = await res.json();
        setResponse(
          data.response ??
            "Logged. A lapse is data, not identity collapse. The protocol continues."
        );
        setTrigger("");
        setThirtyMinBefore("");
        setNotes("");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't log. Try again.");
      }
    });
  };

  if (response) {
    return (
      <div className="rounded-[8px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
        <div className="flex items-center gap-2 font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--accent-base)] mb-3">
          <Check size={11} strokeWidth={2} />
          Logged
        </div>
        <p className="font-sans text-[0.9375rem] leading-[1.65] text-[var(--text-primary)]">
          {response}
        </p>
        <button
          type="button"
          onClick={() => {
            setResponse(null);
            setOpen(false);
          }}
          className="mt-4 font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--text-tertiary)] hover:text-[var(--accent-base)] transition-colors"
      >
        <AlertCircle size={11} strokeWidth={1.75} />
        Log a lapse
      </button>
    );
  }

  return (
    <div className="rounded-[8px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-4">
      <div className="flex items-center gap-2 font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--accent-base)]">
        <AlertCircle size={11} strokeWidth={2} />
        Log a lapse — {cutTarget}
      </div>
      <p className="font-sans text-[0.875rem] leading-[1.6] text-[var(--text-secondary)]">
        Marlatt&rsquo;s research is clear: a lapse is data, not identity
        collapse. Capture the trigger and what came thirty minutes before.
      </p>

      <div className="space-y-3">
        <Field
          label="Trigger"
          placeholder="What was the immediate cue?"
          value={trigger}
          onChange={setTrigger}
        />
        <Field
          label="What came 30 min before"
          placeholder="Stress, scroll, alcohol, location, time of day…"
          value={thirtyMinBefore}
          onChange={setThirtyMinBefore}
        />
        <Field
          label="Notes (optional)"
          placeholder="Anything else worth remembering"
          value={notes}
          onChange={setNotes}
          multiline
        />
      </div>

      <div className="flex items-center justify-between gap-3 pt-2 border-t border-[var(--border-subtle)]">
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={isPending}
          className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={isPending}
          className="inline-flex items-center gap-2 font-mono text-[0.6875rem] tracking-[0.18em] uppercase px-4 py-2 rounded-[5px] bg-[var(--accent-base)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] disabled:opacity-50 transition-colors"
        >
          {isPending ? "Logging…" : "Log it"}
        </button>
      </div>

      {error ? (
        <p className="font-sans text-[0.8125rem] text-[var(--state-danger)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  multiline,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block">
      <span className="block font-mono text-[0.625rem] tracking-[0.18em] uppercase text-[var(--text-tertiary)] mb-1.5">
        {label}
      </span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full px-3 py-2 rounded-[6px] bg-[var(--bg-canvas)] border border-[var(--border-subtle)] focus:border-[var(--accent-base)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-base)] font-sans text-[0.9375rem] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-colors resize-y"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded-[6px] bg-[var(--bg-canvas)] border border-[var(--border-subtle)] focus:border-[var(--accent-base)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-base)] font-sans text-[0.9375rem] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-colors"
        />
      )}
    </label>
  );
}
