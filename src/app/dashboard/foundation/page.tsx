import { redirect } from "next/navigation";
import { Sunrise, Sun, Sunset, Moon, Check, Download } from "lucide-react";
import { resolveOwner } from "@/services/owner";
import { getActiveProtocol } from "@/services/supabase/queries";
import {
  DashboardLayout,
  DashboardPage,
} from "@/components/layouts/DashboardLayout";
import { IdentityHeader } from "@/components/dashboard/IdentityHeader";
import { Section } from "@/components/dashboard/Section";
import { Panel, PanelHeader, PanelBody } from "@/components/dashboard/Panel";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { parseProtocolData, formatAnchor } from "@/lib/protocol/extract";
import type { NonNegotiable } from "@/lib/protocol/types";
import { dayNumber, todayDateString } from "@/lib/date";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";
export const metadata = { title: "Foundation", robots: { index: false, follow: false } };


const TIME_ORDER = ["morning", "midday", "evening", "night"] as const;
const TIME_META = {
  morning: { label: "Morning", icon: Sunrise },
  midday: { label: "Midday", icon: Sun },
  evening: { label: "Evening", icon: Sunset },
  night: { label: "Night", icon: Moon },
} as const;

interface Phase {
  key: string;
  number: number;
  label: string;
  start: number;
  end: number;
  intent: string;
}

function buildPhases(durationDays: number): Phase[] {
  const isOperator = durationDays >= 60;
  if (!isOperator) {
    return [
      {
        key: "substrate",
        number: 1,
        label: "Substrate",
        start: 1,
        end: 14,
        intent:
          "Sleep, sunlight, and your foundational anchors. Days 1-14 will feel worse before better — that's recalibration, not failure.",
      },
      {
        key: "body",
        number: 2,
        label: "Body Reset",
        start: 15,
        end: 30,
        intent:
          "Movement enters the picture. Substrate continues — body work compounds on a stable base, not in spite of it.",
      },
    ];
  }
  return [
    {
      key: "substrate",
      number: 1,
      label: "Substrate",
      start: 1,
      end: 14,
      intent:
        "Sleep, sunlight, and your foundational anchors. Days 1-14 will feel worse before better — that's recalibration, not failure.",
    },
    {
      key: "body",
      number: 2,
      label: "Body Reset",
      start: 15,
      end: 42,
      intent:
        "Movement enters the picture: cardio, resistance, optionally cold. The cut should feel less loud by week 4.",
    },
    {
      key: "mind",
      number: 3,
      label: "Mind Reset",
      start: 43,
      end: 90,
      intent:
        "Meditation, journaling, deep work blocks. By here the substrate is automatic; this layer changes what you do with the day.",
    },
  ];
}

export default async function FoundationPage() {
  const owner = await resolveOwner();
  if (!owner) redirect("/diagnostic");

  const protocol = await getActiveProtocol(owner);
  if (!protocol) redirect("/diagnostic");

  const parsed = parseProtocolData(protocol.protocol_data);
  if (!parsed) redirect("/dashboard");

  const today = todayDateString();
  const day = dayNumber(protocol.start_date, today);
  const phases = buildPhases(protocol.duration_days);
  const currentIdx = Math.max(
    0,
    phases.findIndex((p) => day >= p.start && day <= p.end)
  );
  const current = phases[currentIdx] ?? phases[0];
  const next = phases[currentIdx + 1] ?? null;

  const grouped = TIME_ORDER.map((slot) => ({
    slot,
    items: parsed.non_negotiables.filter((nn) => nn.time_of_day === slot),
  })).filter((g) => g.items.length > 0);

  return (
    <DashboardLayout>
      <IdentityHeader identityStatement={protocol.identity_statement} />
      <DashboardPage>
        <Section
          kicker="Foundation"
          title="The path you&rsquo;re walking."
          description="Three phases, sequential. Substrate first; everything else compounds on top. You're on whichever phase your day count puts you in — the rest of this page shows that phase in detail."
          right={
            <a
              href="/dashboard/foundation/print"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--text-secondary)] hover:text-[var(--accent-base)] transition-colors"
            >
              <Download size={11} strokeWidth={2} />
              Download PDF
            </a>
          }
        />

        <PhaseLadder phases={phases} day={day} currentIdx={currentIdx} />

        {/* Current phase detail */}
        <div className="space-y-10 md:space-y-12">
          <div className="flex items-baseline justify-between gap-6 flex-wrap">
            <div>
              <div className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--accent-base)] mb-2">
                Phase {current.number} · Active
              </div>
              <h2 className="font-serif text-[1.625rem] md:text-[2rem] leading-tight tracking-[-0.018em] text-[var(--text-primary)]">
                {current.label}
              </h2>
            </div>
            <div className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--text-tertiary)] tabular-nums">
              Phase day{" "}
              <span className="text-[var(--text-secondary)]">
                {Math.max(1, day - current.start + 1)}
              </span>{" "}
              / {current.end - current.start + 1}
            </div>
          </div>

          <Panel tone="hero" className="p-7 md:p-9">
            <p className="font-sans text-[1rem] md:text-[1.0625rem] leading-[1.7] text-[var(--text-primary)] max-w-2xl">
              {current.intent}
            </p>
          </Panel>

          {/* Non-negotiables grouped */}
          <div className="space-y-10 md:space-y-12">
            {grouped.map(({ slot, items }) => {
              const meta = TIME_META[slot];
              const Icon = meta.icon;
              return (
                <div key={slot} className="space-y-4">
                  <div className="flex items-center gap-3 px-1">
                    <Icon
                      size={14}
                      strokeWidth={1.5}
                      className="text-[var(--accent-base)]"
                    />
                    <span className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--text-secondary)]">
                      {meta.label}
                    </span>
                    <div className="flex-1 h-px bg-[var(--border-subtle)]" />
                    <span className="font-mono text-[0.6875rem] tabular-nums text-[var(--text-tertiary)]">
                      {items.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {items.map((nn) => (
                      <NonNegotiableCard key={nn.id} nn={nn} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Panel className="p-6 md:p-7">
              <div className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--accent-base)] mb-3">
                Expectations
              </div>
              <p className="font-sans text-[0.9375rem] md:text-[1rem] leading-[1.7] text-[var(--text-primary)]">
                {parsed.protocol_notes.expectations}
              </p>
            </Panel>
            <Panel tone="subtle" className="p-6 md:p-7">
              <div className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--accent-base)] mb-3">
                If you lapse
              </div>
              <p className="font-sans text-[0.9375rem] md:text-[1rem] leading-[1.7] text-[var(--text-primary)]">
                {parsed.protocol_notes.lapse_handling}
              </p>
            </Panel>
          </div>
        </div>

        {/* Next phase preview */}
        {next ? (
          <NextPhasePreview phase={next} day={day} />
        ) : (
          <Panel tone="subtle" className="p-6 md:p-7">
            <div className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--text-tertiary)] mb-2">
              End of path
            </div>
            <p className="font-sans text-[0.9375rem] md:text-[1rem] leading-[1.65] text-[var(--text-secondary)] max-w-2xl">
              You&rsquo;re in the final phase. After day {protocol.duration_days}, the
              substrate is the foundation you operate on, not a protocol.
            </p>
          </Panel>
        )}
      </DashboardPage>
    </DashboardLayout>
  );
}

function PhaseLadder({
  phases,
  day,
  currentIdx,
}: {
  phases: Phase[];
  day: number;
  currentIdx: number;
}) {
  const total = phases[phases.length - 1].end;
  const overallPct = Math.min(100, Math.max(0, (day / total) * 100));
  return (
    <Panel tone="default" className="p-7 md:p-9 overflow-hidden">
      <div className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--text-tertiary)] mb-6">
        Path
      </div>

      {/* Desktop horizontal ladder */}
      <div className="hidden md:block">
        <div className="relative">
          {/* base track */}
          <div className="absolute left-0 right-0 top-[14px] h-[2px] bg-[var(--border-subtle)] rounded-full" />
          {/* progress fill */}
          <div
            className="absolute left-0 top-[14px] h-[2px] bg-[var(--accent-base)] rounded-full transition-all"
            style={{ width: `${overallPct}%` }}
          />
          <div
            className="relative grid"
            style={{ gridTemplateColumns: `repeat(${phases.length}, 1fr)` }}
          >
            {phases.map((p, i) => {
              const past = i < currentIdx;
              const active = i === currentIdx;
              return (
                <div
                  key={p.key}
                  className={cn(
                    "flex flex-col items-center text-center",
                    i === 0 && "items-start text-left",
                    i === phases.length - 1 && "items-end text-right"
                  )}
                >
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full border flex items-center justify-center transition-colors",
                      active &&
                        "bg-[var(--accent-base)] border-[var(--accent-base)]",
                      past &&
                        "bg-[var(--accent-muted)] border-[var(--accent-base)]/60",
                      !active && !past &&
                        "bg-[var(--bg-canvas)] border-[var(--border-default)]"
                    )}
                  >
                    {past ? (
                      <Check
                        size={13}
                        strokeWidth={2.5}
                        className="text-[var(--text-primary)]"
                      />
                    ) : active ? (
                      <span className="w-2 h-2 rounded-full bg-[var(--text-primary)]" />
                    ) : (
                      <span className="font-mono text-[0.6875rem] tabular-nums text-[var(--text-tertiary)]">
                        {p.number}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 max-w-[14rem]">
                    <div
                      className={cn(
                        "font-serif text-[1.0625rem] leading-tight tracking-[-0.005em]",
                        active
                          ? "text-[var(--text-primary)]"
                          : past
                            ? "text-[var(--text-secondary)]"
                            : "text-[var(--text-tertiary)]"
                      )}
                    >
                      {p.label}
                    </div>
                    <div className="mt-1 font-mono text-[0.625rem] tracking-[0.12em] uppercase text-[var(--text-tertiary)] tabular-nums">
                      Day {p.start}–{p.end}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile vertical timeline */}
      <div className="md:hidden">
        <ol className="space-y-5 relative">
          {phases.map((p, i) => {
            const past = i < currentIdx;
            const active = i === currentIdx;
            const isLast = i === phases.length - 1;
            return (
              <li key={p.key} className="relative flex gap-4">
                {!isLast ? (
                  <div className="absolute left-[13px] top-7 bottom-[-20px] w-px bg-[var(--border-subtle)]" />
                ) : null}
                <div
                  className={cn(
                    "shrink-0 w-7 h-7 rounded-full border flex items-center justify-center z-10",
                    active &&
                      "bg-[var(--accent-base)] border-[var(--accent-base)]",
                    past &&
                      "bg-[var(--accent-muted)] border-[var(--accent-base)]/60",
                    !active && !past &&
                      "bg-[var(--bg-canvas)] border-[var(--border-default)]"
                  )}
                >
                  {past ? (
                    <Check
                      size={13}
                      strokeWidth={2.5}
                      className="text-[var(--text-primary)]"
                    />
                  ) : active ? (
                    <span className="w-2 h-2 rounded-full bg-[var(--text-primary)]" />
                  ) : (
                    <span className="font-mono text-[0.6875rem] tabular-nums text-[var(--text-tertiary)]">
                      {p.number}
                    </span>
                  )}
                </div>
                <div className="pb-1">
                  <div
                    className={cn(
                      "font-serif text-[1.0625rem] leading-tight",
                      active
                        ? "text-[var(--text-primary)]"
                        : past
                          ? "text-[var(--text-secondary)]"
                          : "text-[var(--text-tertiary)]"
                    )}
                  >
                    {p.label}
                  </div>
                  <div className="mt-0.5 font-mono text-[0.625rem] tracking-[0.12em] uppercase text-[var(--text-tertiary)] tabular-nums">
                    Day {p.start}–{p.end}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-7 md:mt-9">
        <ProgressBar value={overallPct} thickness="sm" />
        <div className="mt-2 flex items-center justify-between font-mono text-[0.625rem] tabular-nums text-[var(--text-tertiary)]">
          <span>Day {day}</span>
          <span>{Math.round(overallPct)}% of protocol</span>
          <span>Day {total}</span>
        </div>
      </div>
    </Panel>
  );
}

function NextPhasePreview({ phase, day }: { phase: Phase; day: number }) {
  const daysUntil = Math.max(0, phase.start - day);
  return (
    <Panel tone="subtle" className="p-6 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-5 md:gap-8 items-start">
        <div className="flex md:flex-col gap-4 md:gap-1 items-baseline md:items-start">
          <div className="font-serif text-[2rem] md:text-[2.5rem] leading-none tracking-[-0.02em] text-[var(--text-primary)] tabular-nums">
            {daysUntil}
          </div>
          <div className="font-mono text-[0.625rem] tracking-[0.18em] uppercase text-[var(--text-tertiary)]">
            days until next phase
          </div>
        </div>
        <div className="space-y-2">
          <div className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--accent-base)]">
            Up next · Phase {phase.number}
          </div>
          <h3 className="font-serif text-[1.375rem] md:text-[1.5rem] leading-tight tracking-[-0.01em] text-[var(--text-primary)]">
            {phase.label}
          </h3>
          <p className="font-sans text-[0.9375rem] md:text-[1rem] leading-[1.65] text-[var(--text-secondary)] max-w-2xl">
            {phase.intent}
          </p>
        </div>
      </div>
    </Panel>
  );
}

function NonNegotiableCard({ nn }: { nn: NonNegotiable }) {
  return (
    <Panel tone="default" className="h-full flex flex-col">
      <PanelHeader title={nn.title} kicker={nn.research_citation} />
      <PanelBody className="flex-1 flex flex-col gap-4">
        <p className="font-serif italic text-[1.0625rem] leading-[1.4] tracking-[-0.005em] text-[var(--text-primary)]">
          &ldquo;{nn.tiny_action}&rdquo;
        </p>
        <p className="font-sans text-[0.9375rem] leading-[1.55] text-[var(--text-secondary)]">
          {nn.rationale}
        </p>
        <div className="mt-auto pt-3">
          <span className="inline-flex items-center font-mono text-[0.625rem] tracking-[0.12em] uppercase text-[var(--text-tertiary)] px-2 py-1 rounded-[4px] bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
            anchor: {formatAnchor(nn.anchor)}
          </span>
        </div>
      </PanelBody>
    </Panel>
  );
}
