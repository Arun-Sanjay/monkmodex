"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  List,
  Notebook,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Panel } from "./Panel";
import { todayDateString } from "@/lib/date";
import type { CheckinRow } from "@/services/supabase/types";

/**
 * JournalEditor — split-pane: recent-entries list + editor for the
 * selected date. Allows writing or editing entries for any past day
 * within the protocol. Auto-saves on blur (debounced) and on explicit
 * Save click.
 */
export function JournalEditor({
  protocolId,
  startDate,
  durationDays,
  initialCheckins,
}: {
  protocolId: string;
  startDate: string;
  durationDays: number;
  initialCheckins: CheckinRow[];
}) {
  const today = todayDateString();
  const params = useSearchParams();
  const router = useRouter();
  const dateFromUrl = params.get("date");

  const [entriesByDate, setEntriesByDate] = useState<Record<string, string>>(
    () => {
      const map: Record<string, string> = {};
      for (const c of initialCheckins) {
        if (c.journal_text?.trim()) map[c.date] = c.journal_text;
      }
      return map;
    }
  );

  const initialDate =
    dateFromUrl && isValidDate(dateFromUrl) && isInProtocol(dateFromUrl, startDate, durationDays)
      ? dateFromUrl
      : today;
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [text, setText] = useState(entriesByDate[initialDate] ?? "");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-grow textarea
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.max(220, ta.scrollHeight) + "px";
  }, [text]);

  // Update URL when date changes
  useEffect(() => {
    if (dateFromUrl !== selectedDate) {
      const url =
        selectedDate === today
          ? "/dashboard/journal"
          : `/dashboard/journal?date=${selectedDate}`;
      router.replace(url, { scroll: false });
    }
  }, [selectedDate, dateFromUrl, router, today]);

  // Load saved text when switching dates
  useEffect(() => {
    setText(entriesByDate[selectedDate] ?? "");
    setError(null);
    setSavedAt(null);
  }, [selectedDate, entriesByDate]);

  const dirty = text !== (entriesByDate[selectedDate] ?? "");
  const showSaved = savedAt !== null && !dirty;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const save = useCallback(() => {
    if (!dirty || isPending) return;
    setError(null);
    const next = text;
    const date = selectedDate;
    startTransition(async () => {
      try {
        const res = await fetch("/api/checkins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ protocolId, date, journalText: next || null }),
        });
        if (!res.ok) throw new Error(await res.text());
        setEntriesByDate((prev) => {
          const copy = { ...prev };
          if (next.trim()) copy[date] = next;
          else delete copy[date];
          return copy;
        });
        setSavedAt(Date.now());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't save");
      }
    });
  }, [dirty, isPending, text, selectedDate, protocolId]);

  const sortedDates = useMemo(() => {
    return Object.keys(entriesByDate).sort((a, b) => b.localeCompare(a));
  }, [entriesByDate]);

  const goPrev = () => {
    const prev = shiftDate(selectedDate, -1);
    if (isInProtocol(prev, startDate, durationDays)) setSelectedDate(prev);
  };
  const goNext = () => {
    if (selectedDate >= today) return;
    const next = shiftDate(selectedDate, 1);
    if (isInProtocol(next, startDate, durationDays) && next <= today)
      setSelectedDate(next);
  };

  const isToday = selectedDate === today;
  const canGoPrev = isInProtocol(shiftDate(selectedDate, -1), startDate, durationDays);
  const canGoNext = !isToday;

  const [drawerOpen, setDrawerOpen] = useState(false);

  // Auto-close drawer when selecting a date on mobile
  useEffect(() => {
    setDrawerOpen(false);
  }, [selectedDate]);

  // Esc closes the drawer
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5 lg:gap-7 items-start">
      {/* Mobile-only entry list trigger */}
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-3 rounded-[8px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] transition-colors w-full"
      >
        <List size={14} strokeWidth={1.5} className="text-[var(--accent-base)]" />
        <span className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--text-secondary)]">
          Recent entries
        </span>
        <span className="ml-auto font-mono text-[0.625rem] tracking-[0.12em] uppercase text-[var(--text-tertiary)] tabular-nums">
          {sortedDates.length}
        </span>
      </button>

      {/* Mobile drawer */}
      {drawerOpen ? (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative w-[85%] max-w-sm bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] overflow-y-auto p-5 animate-in slide-in-from-left">
            <div className="flex items-center justify-between mb-5">
              <div className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--text-tertiary)] flex items-center gap-2">
                <Notebook size={11} strokeWidth={1.5} />
                Recent entries
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-full border border-[var(--border-subtle)] hover:border-[var(--border-strong)] flex items-center justify-center text-[var(--text-secondary)]"
                aria-label="Close"
              >
                <X size={14} strokeWidth={1.75} />
              </button>
            </div>
            <SidebarList
              today={today}
              isToday={isToday}
              sortedDates={sortedDates}
              entriesByDate={entriesByDate}
              selectedDate={selectedDate}
              onSelect={setSelectedDate}
            />
          </div>
        </div>
      ) : null}

      {/* Desktop sidebar */}
      <Panel className="hidden lg:block p-5 lg:sticky lg:top-6 max-h-[80vh] overflow-y-auto">
        <div className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--text-tertiary)] mb-4 flex items-center gap-2">
          <Notebook size={11} strokeWidth={1.5} />
          Recent entries
        </div>
        <SidebarList
          today={today}
          isToday={isToday}
          sortedDates={sortedDates}
          entriesByDate={entriesByDate}
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
        />
      </Panel>

      {/* Editor */}
      <Panel tone="default" className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 md:px-7 py-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={goPrev}
              disabled={!canGoPrev}
              aria-label="Previous day"
              className="w-8 h-8 rounded-[6px] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!canGoNext}
              aria-label="Next day"
              className="w-8 h-8 rounded-[6px] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} strokeWidth={1.75} />
            </button>
          </div>

          <div className="flex-1 text-center">
            <div className="font-serif text-[1.125rem] md:text-[1.25rem] tracking-[-0.01em] text-[var(--text-primary)]">
              {formatFullDate(selectedDate)}
            </div>
            {isToday ? (
              <div className="mt-0.5 font-mono text-[0.625rem] tracking-[0.18em] uppercase text-[var(--accent-base)]">
                Today
              </div>
            ) : null}
          </div>

          <div className="font-mono text-[0.6875rem] tabular-nums text-[var(--text-tertiary)] min-w-[3.5rem] text-right">
            {wordCount} words
          </div>
        </div>

        <div className="px-5 md:px-7 py-5">
          <textarea
            ref={taRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={save}
            placeholder={
              isToday
                ? "What was hard today? What worked? Trigger, time, what came 30 minutes before. Or anything."
                : "Backfill a reflection for this day."
            }
            className="w-full bg-transparent border-0 outline-none focus:ring-0 resize-none font-sans text-[1rem] md:text-[1.0625rem] leading-[1.7] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] min-h-[220px]"
          />

          <div className="mt-4 flex items-center justify-between gap-4 pt-3 border-t border-[var(--border-subtle)]">
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
              className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase px-4 py-2 rounded-[5px] bg-[var(--accent-base)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function SidebarList({
  today,
  isToday,
  sortedDates,
  entriesByDate,
  selectedDate,
  onSelect,
}: {
  today: string;
  isToday: boolean;
  sortedDates: string[];
  entriesByDate: Record<string, string>;
  selectedDate: string;
  onSelect: (d: string) => void;
}) {
  return (
    <>
      {!isToday && !sortedDates.includes(today) ? (
        <button
          type="button"
          onClick={() => onSelect(today)}
          className="w-full text-left mb-3 px-3 py-2 rounded-[6px] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          <div className="font-mono text-[0.625rem] tracking-[0.18em] uppercase text-[var(--accent-base)]">
            Jump to today
          </div>
          <div className="mt-0.5 font-sans text-[0.8125rem] text-[var(--text-secondary)]">
            {formatLabel(today)}
          </div>
        </button>
      ) : null}

      {sortedDates.length === 0 ? (
        <p className="font-sans text-[0.8125rem] leading-[1.55] text-[var(--text-tertiary)]">
          No entries yet. Today is a fine day to start.
        </p>
      ) : (
        <ul className="space-y-1">
          {sortedDates.map((d) => {
            const entry = entriesByDate[d];
            const active = d === selectedDate;
            return (
              <li key={d}>
                <button
                  type="button"
                  onClick={() => onSelect(d)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-[6px] transition-colors",
                    active
                      ? "bg-[var(--accent-muted)]/40 border border-[var(--accent-base)]/40"
                      : "border border-transparent hover:bg-[var(--bg-elevated)] hover:border-[var(--border-subtle)]"
                  )}
                >
                  <div
                    className={cn(
                      "font-mono text-[0.625rem] tracking-[0.18em] uppercase tabular-nums",
                      active
                        ? "text-[var(--accent-base)]"
                        : "text-[var(--text-tertiary)]"
                    )}
                  >
                    {formatLabel(d)}
                  </div>
                  <div
                    className={cn(
                      "mt-1 font-sans text-[0.8125rem] leading-[1.4] line-clamp-2",
                      active
                        ? "text-[var(--text-primary)]"
                        : "text-[var(--text-secondary)]"
                    )}
                  >
                    {entry.split("\n").join(" ").slice(0, 100)}
                    {entry.length > 100 ? "…" : ""}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function isValidDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function isInProtocol(
  date: string,
  startDate: string,
  durationDays: number
): boolean {
  if (!isValidDate(date)) return false;
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(start.getTime() + (durationDays - 1) * 86400000);
  const d = new Date(`${date}T00:00:00Z`);
  return d >= start && d <= end;
}

function shiftDate(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

function formatLabel(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatFullDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
