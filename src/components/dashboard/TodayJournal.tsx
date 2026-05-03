"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ChevronDown, Notebook } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * TodayJournal — collapsible daily reflection. Saves on blur (or explicit
 * save) via POST /api/checkins. Quiet feedback: a small "Saved" pulse, no
 * confetti.
 */
export function TodayJournal({
  protocolId,
  date,
  initialText,
}: {
  protocolId: string;
  date: string;
  initialText: string;
}) {
  const [open, setOpen] = useState(initialText.length > 0);
  const [text, setText] = useState(initialText);
  const [savedText, setSavedText] = useState(initialText);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-grow textarea
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + "px";
  }, [text, open]);

  const dirty = text !== savedText;

  const save = () => {
    if (!dirty) return;
    setError(null);
    const next = text;
    startTransition(async () => {
      try {
        const res = await fetch("/api/checkins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            protocolId,
            date,
            journalText: next,
          }),
        });
        if (!res.ok) {
          throw new Error(await res.text());
        }
        setSavedText(next);
        setSavedAt(Date.now());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't save");
      }
    });
  };

  const charCount = text.length;
  const showSaved = savedAt !== null && !dirty;

  return (
    <div className="rounded-[8px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 md:px-6 py-4 text-left hover:bg-[var(--bg-elevated)] transition-colors"
      >
        <Notebook
          size={14}
          strokeWidth={1.5}
          className="text-[var(--accent-base)]"
        />
        <span className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--text-secondary)]">
          Reflection
        </span>
        <span className="font-mono text-[0.6875rem] tracking-[0.12em] uppercase text-[var(--text-tertiary)] tabular-nums">
          {charCount > 0 ? `${charCount} chars` : "Optional"}
        </span>
        <div className="flex-1" />
        <ChevronDown
          size={16}
          strokeWidth={1.5}
          className={cn(
            "text-[var(--text-tertiary)] transition-transform duration-200",
            open ? "rotate-180" : "rotate-0"
          )}
        />
      </button>

      {open ? (
        <div className="px-5 md:px-6 pb-5 md:pb-6 space-y-3">
          <textarea
            ref={taRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={save}
            placeholder="What was hard today? What worked? Trigger, time, what came 30 minutes before. Or anything."
            rows={3}
            className="w-full resize-none bg-transparent border-0 outline-none focus:ring-0 font-sans text-[1rem] md:text-[1.0625rem] leading-[1.65] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] py-1"
          />

          <div className="flex items-center justify-between gap-4 pt-2 border-t border-[var(--border-subtle)]">
            <div className="font-mono text-[0.6875rem] tracking-[0.12em] uppercase text-[var(--text-tertiary)]">
              {error ? (
                <span className="text-[var(--state-danger)]">{error}</span>
              ) : isPending ? (
                "Saving…"
              ) : showSaved ? (
                <span className="text-[var(--state-success)]">Saved</span>
              ) : dirty ? (
                "Unsaved"
              ) : (
                "Auto-saves on blur"
              )}
            </div>
            <button
              type="button"
              onClick={save}
              disabled={!dirty || isPending}
              className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase px-3 py-1.5 rounded-[5px] bg-[var(--accent-base)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
