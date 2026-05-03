"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Notebook } from "lucide-react";
import { cn } from "@/lib/cn";
import { Panel } from "./Panel";
import { ProgressRing } from "./ProgressRing";
import { todayDateString, formatShortDate } from "@/lib/date";
import type { CheckinRow } from "@/services/supabase/types";
import type { NonNegotiable } from "@/lib/protocol/types";

const DOW_LABELS = ["S", "M", "T", "W", "T", "F", "S"] as const;

/**
 * CalendarView — month grid + day-detail side panel. Clicking a day
 * selects it and shows that day's stats in the right pane (desktop) or
 * below (mobile). Cells render as oxblood heatmap by % completion.
 */
export function CalendarView({
  startDate,
  durationDays,
  nonNegotiables,
  checkins,
}: {
  startDate: string;
  durationDays: number;
  nonNegotiables: NonNegotiable[];
  checkins: CheckinRow[];
}) {
  const today = todayDateString();
  const totalNN = nonNegotiables.length;
  const checkinsByDate = useMemo(
    () => new Map(checkins.map((c) => [c.date, c])),
    [checkins]
  );
  const nnById = useMemo(
    () => new Map(nonNegotiables.map((nn) => [nn.id, nn])),
    [nonNegotiables]
  );

  const [selectedDate, setSelectedDate] = useState<string>(today);

  const start = utcDate(startDate);
  const lastInclusive = new Date(start.getTime() + (durationDays - 1) * 86400000);
  const endDate = toIsoDate(lastInclusive);
  const months = listMonths(start, lastInclusive);

  const loggedCount = checkins.filter((c) => c.completed_items.length > 0).length;
  const elapsedDays = Math.max(1, dayDiff(start, today) + 1);
  const totalPossible = elapsedDays * Math.max(1, totalNN);
  const totalDone = checkins.reduce(
    (sum, c) => sum + Math.min(c.completed_items.length, totalNN),
    0
  );
  const overallPct =
    totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;

  return (
    <div className="space-y-7 md:space-y-9">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <SummaryStat label="Days logged" value={`${loggedCount} / ${durationDays}`} />
        <SummaryStat label="Avg completion" value={`${overallPct}%`} />
        <SummaryStat label="Start" value={formatShortDate(startDate)} />
        <SummaryStat label="End" value={formatShortDate(endDate)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 lg:gap-7 items-start">
        {/* Calendar grid — order-2 on mobile so detail panel comes first */}
        <Panel className="p-5 md:p-7 order-2 lg:order-1">
          <div className="space-y-9">
            {months.map((m) => (
              <MonthBlock
                key={`${m.year}-${m.month}`}
                year={m.year}
                month={m.month}
                startDate={startDate}
                endDate={endDate}
                today={today}
                selectedDate={selectedDate}
                onSelect={setSelectedDate}
                totalNN={totalNN}
                checkinsByDate={checkinsByDate}
              />
            ))}
          </div>
        </Panel>

        {/* Day detail — order-1 on mobile (above grid), order-2 on desktop (right side) */}
        <div className="order-1 lg:order-2">
          <DayDetail
            date={selectedDate}
            startDate={startDate}
            endDate={endDate}
            today={today}
            totalNN={totalNN}
            durationDays={durationDays}
            checkin={checkinsByDate.get(selectedDate)}
            nnById={nnById}
            allNN={nonNegotiables}
          />
        </div>
      </div>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3.5">
      <div className="font-mono text-[0.625rem] tracking-[0.18em] uppercase text-[var(--text-tertiary)] mb-1">
        {label}
      </div>
      <div className="font-serif text-[1.125rem] tracking-[-0.005em] text-[var(--text-primary)] tabular-nums">
        {value}
      </div>
    </div>
  );
}

function MonthBlock({
  year,
  month,
  startDate,
  endDate,
  today,
  selectedDate,
  onSelect,
  totalNN,
  checkinsByDate,
}: {
  year: number;
  month: number;
  startDate: string;
  endDate: string;
  today: string;
  selectedDate: string;
  onSelect: (date: string) => void;
  totalNN: number;
  checkinsByDate: Map<string, CheckinRow>;
}) {
  const cells = monthGridCells(year, month);
  const monthLabel = new Date(Date.UTC(year, month, 1)).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric", timeZone: "UTC" }
  );

  return (
    <div className="space-y-3">
      <h3 className="font-serif text-[1.1875rem] md:text-[1.3125rem] tracking-[-0.012em] text-[var(--text-primary)]">
        {monthLabel}
      </h3>
      <div className="grid grid-cols-7 gap-1.5 md:gap-2">
        {DOW_LABELS.map((d, i) => (
          <div
            key={i}
            className="font-mono text-[0.625rem] tracking-[0.18em] uppercase text-[var(--text-tertiary)] text-center pb-1"
          >
            {d}
          </div>
        ))}
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} aria-hidden />;
          const inProtocol = cell.date >= startDate && cell.date <= endDate;
          const isToday = cell.date === today;
          const isFuture = cell.date > today;
          const isSelected = cell.date === selectedDate;
          const checkin = checkinsByDate.get(cell.date);
          const completed = checkin?.completed_items.length ?? 0;
          const pct =
            totalNN > 0 ? Math.min(100, (completed / totalNN) * 100) : 0;
          return (
            <DayCell
              key={cell.date}
              date={cell.date}
              dayOfMonth={cell.dayOfMonth}
              pct={pct}
              isToday={isToday}
              isFuture={isFuture}
              isSelected={isSelected}
              inProtocol={inProtocol}
              completed={completed}
              total={totalNN}
              onClick={() => onSelect(cell.date)}
            />
          );
        })}
      </div>
    </div>
  );
}

function DayCell({
  date,
  dayOfMonth,
  pct,
  isToday,
  isFuture,
  isSelected,
  inProtocol,
  completed,
  total,
  onClick,
}: {
  date: string;
  dayOfMonth: number;
  pct: number;
  isToday: boolean;
  isFuture: boolean;
  isSelected: boolean;
  inProtocol: boolean;
  completed: number;
  total: number;
  onClick: () => void;
}) {
  const heat = pct / 100;
  const fillAlpha = inProtocol && !isFuture ? 0.18 + heat * 0.7 : 0;
  const glow = inProtocol && !isFuture && heat > 0.3 ? heat * 14 : 0;
  return (
    <button
      type="button"
      onClick={onClick}
      title={
        inProtocol
          ? `${date} — ${completed}/${total} completed (${Math.round(pct)}%)`
          : `${date} (outside protocol)`
      }
      className={cn(
        "group relative aspect-square rounded-[6px] flex items-center justify-center transition-all duration-150",
        !inProtocol && "opacity-30 cursor-default",
        inProtocol && !isFuture && "border border-[var(--border-subtle)]",
        inProtocol && isFuture && "border border-dashed border-[var(--border-subtle)]",
        !inProtocol && "border border-[var(--border-subtle)]/50",
        isToday && !isSelected && "ring-1 ring-[var(--accent-base)]/70",
        isSelected && "ring-2 ring-[var(--accent-base)]",
        inProtocol && "hover:border-[var(--border-strong)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]"
      )}
      style={{
        backgroundColor:
          fillAlpha > 0
            ? `rgba(122,31,36,${fillAlpha})`
            : "var(--bg-surface)",
        boxShadow:
          glow > 0
            ? `0 0 ${glow}px rgba(122,31,36,${0.3 + heat * 0.3})`
            : undefined,
      }}
    >
      <span
        className={cn(
          "font-mono text-[0.6875rem] tabular-nums",
          isFuture
            ? "text-[var(--text-tertiary)]"
            : pct > 0.5
              ? "text-[var(--text-primary)]"
              : "text-[var(--text-secondary)]"
        )}
      >
        {dayOfMonth}
      </span>
    </button>
  );
}

function DayDetail({
  date,
  startDate,
  endDate,
  today,
  totalNN,
  durationDays,
  checkin,
  nnById,
  allNN,
}: {
  date: string;
  startDate: string;
  endDate: string;
  today: string;
  totalNN: number;
  durationDays: number;
  checkin?: CheckinRow;
  nnById: Map<string, NonNegotiable>;
  allNN: NonNegotiable[];
}) {
  const inProtocol = date >= startDate && date <= endDate;
  const isFuture = date > today;
  const dayN = inProtocol ? dayDiff(utcDate(startDate), date) + 1 : null;
  const phaseLabel =
    dayN === null
      ? null
      : dayN <= 14
        ? "Substrate"
        : dayN <= 42
          ? "Body Reset"
          : "Mind Reset";

  const completed = checkin?.completed_items ?? [];
  const journal = checkin?.journal_text ?? "";
  const pct =
    totalNN > 0 ? (completed.length / totalNN) * 100 : 0;

  const completedSet = new Set(completed);

  return (
    <Panel tone="default" className="p-6 md:p-7 lg:sticky lg:top-6">
      <div className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--accent-base)] mb-2">
        Day detail
      </div>
      <h3 className="font-serif text-[1.375rem] md:text-[1.5rem] leading-tight tracking-[-0.012em] text-[var(--text-primary)]">
        {formatLongDate(date)}
      </h3>

      <div className="mt-1 font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--text-tertiary)] tabular-nums">
        {!inProtocol ? (
          "Outside protocol"
        ) : isFuture ? (
          <>Day {dayN} · upcoming</>
        ) : (
          <>
            Day <span className="text-[var(--text-secondary)]">{dayN}</span>{" "}
            of {durationDays}
            {phaseLabel ? (
              <span className="text-[var(--accent-base)]"> · {phaseLabel}</span>
            ) : null}
          </>
        )}
      </div>

      {inProtocol && !isFuture ? (
        <>
          <div className="mt-6 flex items-center gap-5">
            <ProgressRing value={pct} size={84} thickness={6} />
            <div>
              <div className="font-serif text-[1.5rem] leading-none tracking-[-0.015em] text-[var(--text-primary)] tabular-nums">
                {completed.length} / {totalNN}
              </div>
              <div className="mt-1 font-mono text-[0.6875rem] tracking-[0.12em] uppercase text-[var(--text-tertiary)]">
                non-negotiables
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-1.5">
            {allNN.map((nn) => {
              const done = completedSet.has(nn.id);
              return (
                <div
                  key={nn.id}
                  className={cn(
                    "flex items-start gap-3 px-3 py-2 rounded-[6px]",
                    done
                      ? "bg-[var(--accent-muted)]/30 border border-[var(--accent-base)]/30"
                      : "border border-[var(--border-subtle)]"
                  )}
                >
                  <div
                    className={cn(
                      "shrink-0 mt-0.5 w-4 h-4 rounded-[4px] border flex items-center justify-center",
                      done
                        ? "bg-[var(--accent-base)] border-[var(--accent-base)]"
                        : "border-[var(--border-default)]"
                    )}
                  >
                    {done ? (
                      <Check
                        size={10}
                        strokeWidth={2.5}
                        className="text-[var(--text-primary)]"
                      />
                    ) : null}
                  </div>
                  <span
                    className={cn(
                      "font-sans text-[0.875rem] leading-[1.3]",
                      done
                        ? "text-[var(--text-secondary)]"
                        : "text-[var(--text-primary)]"
                    )}
                  >
                    {nn.title}
                  </span>
                </div>
              );
            })}
          </div>

          {journal.trim() ? (
            <div className="mt-6 pt-5 border-t border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--accent-base)] mb-2">
                <Notebook size={11} strokeWidth={1.5} />
                Reflection
              </div>
              <p className="font-sans text-[0.875rem] leading-[1.6] text-[var(--text-primary)] line-clamp-5">
                {journal.trim()}
              </p>
              <Link
                href="/dashboard/journal"
                className="mt-3 inline-flex items-center gap-1.5 font-mono text-[0.625rem] tracking-[0.18em] uppercase text-[var(--text-secondary)] hover:text-[var(--accent-base)] transition-colors"
              >
                Open in journal
                <ArrowRight size={11} strokeWidth={2} />
              </Link>
            </div>
          ) : (
            <div className="mt-6 pt-5 border-t border-[var(--border-subtle)] font-sans text-[0.8125rem] text-[var(--text-tertiary)]">
              No reflection logged.
            </div>
          )}
        </>
      ) : isFuture && inProtocol ? (
        <p className="mt-6 font-sans text-[0.875rem] leading-[1.6] text-[var(--text-secondary)]">
          You haven&rsquo;t lived this day yet. The substrate compounds —
          today&rsquo;s effort is what makes day {dayN} possible.
        </p>
      ) : (
        <p className="mt-6 font-sans text-[0.875rem] leading-[1.6] text-[var(--text-tertiary)]">
          This date is outside your protocol window.
        </p>
      )}
    </Panel>
  );
}

/* ------------ helpers ------------ */

function utcDate(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}
function toIsoDate(d: Date): string {
  return d.toISOString().split("T")[0];
}
function dayDiff(a: Date, b: string): number {
  return Math.floor((utcDate(b).getTime() - a.getTime()) / 86400000);
}
function listMonths(start: Date, end: Date) {
  const months: { year: number; month: number }[] = [];
  const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  const endMarker = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
  while (cursor.getTime() <= endMarker.getTime()) {
    months.push({
      year: cursor.getUTCFullYear(),
      month: cursor.getUTCMonth(),
    });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return months;
}
function monthGridCells(year: number, month: number) {
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const startDow = firstOfMonth.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: ({ date: string; dayOfMonth: number } | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(Date.UTC(year, month, d));
    cells.push({ date: toIsoDate(dt), dayOfMonth: d });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
function formatLongDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
