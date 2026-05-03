import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Lock, Notebook } from "lucide-react";
import { getSessionToken } from "@/services/session";
import {
  getActiveProtocol,
  getCheckinsForProtocol,
} from "@/services/supabase/queries";
import {
  DashboardLayout,
  DashboardPage,
} from "@/components/layouts/DashboardLayout";
import { IdentityHeader } from "@/components/dashboard/IdentityHeader";
import { Section } from "@/components/dashboard/Section";
import { Panel } from "@/components/dashboard/Panel";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { parseProtocolData } from "@/lib/protocol/extract";
import { dayNumber, todayDateString, formatShortDate } from "@/lib/date";
import { cn } from "@/lib/cn";
import { cutSlug } from "@/components/dashboard/CutsStrip";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const sessionToken = await getSessionToken();
  if (!sessionToken) redirect("/diagnostic");

  const protocol = await getActiveProtocol(sessionToken);
  if (!protocol) redirect("/diagnostic");

  const parsed = parseProtocolData(protocol.protocol_data);
  if (!parsed) redirect("/dashboard");

  const today = todayDateString();
  const day = dayNumber(protocol.start_date, today);
  const checkins = await getCheckinsForProtocol(protocol.id);
  const checkinsByDate = new Map(checkins.map((c) => [c.date, c]));

  const totalNN = parsed.non_negotiables.length;
  const elapsedDays = Math.max(1, Math.min(day, protocol.duration_days));
  const totalDone = checkins.reduce(
    (sum, c) => sum + Math.min(c.completed_items.length, totalNN),
    0
  );
  const totalPossible = elapsedDays * Math.max(1, totalNN);
  const adherencePct =
    totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;

  // 30-day strip — last 30 days ending today, but only show in-protocol cells
  const stripDays = buildStripDays(protocol.start_date, today, 30);

  // Per-NN adherence
  const nnStats = parsed.non_negotiables.map((nn) => {
    const completed = checkins.filter((c) =>
      c.completed_items.includes(nn.id)
    ).length;
    const pct = elapsedDays > 0 ? Math.round((completed / elapsedDays) * 100) : 0;
    return { nn, completed, pct };
  });

  // Recent journal entries
  const journalEntries = checkins
    .filter((c) => c.journal_text?.trim())
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  // Phase
  const phase = getCurrentPhase(day, protocol.duration_days);
  const overallPct = Math.min(100, (day / protocol.duration_days) * 100);

  // Current week
  const currentWeekIdx = Math.min(
    parsed.weeks.length,
    Math.max(1, Math.ceil(day / 7))
  );
  const currentWeek = parsed.weeks.find((w) => w.week_number === currentWeekIdx);

  return (
    <DashboardLayout>
      <IdentityHeader identityStatement={protocol.identity_statement} />
      <DashboardPage>
        <Section
          kicker="Overview"
          title="A bird&rsquo;s-eye on the protocol."
          description="Where you are, how you&rsquo;ve been holding, what&rsquo;s loaded for this week. The Today page is for doing — this page is for assessing."
        />

        {/* Where you are */}
        <Panel tone="hero" className="p-7 md:p-9">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 md:gap-10 items-start">
            <div>
              <div className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--accent-base)] mb-2">
                {phase.label} phase · day {day}
              </div>
              <h2 className="font-serif text-[1.625rem] md:text-[2rem] leading-tight tracking-[-0.018em] text-[var(--text-primary)]">
                {phase.headline}
              </h2>
              <p className="mt-3 font-sans text-[0.9375rem] md:text-[1rem] leading-[1.65] text-[var(--text-secondary)] max-w-2xl">
                {phase.copy}
              </p>
            </div>
            <div className="flex md:flex-col md:items-end gap-4 md:gap-2">
              <div className="text-right">
                <div className="font-serif text-[2.25rem] md:text-[2.5rem] leading-none tracking-[-0.02em] text-[var(--text-primary)] tabular-nums">
                  {adherencePct}%
                </div>
                <div className="mt-1 font-mono text-[0.625rem] tracking-[0.18em] uppercase text-[var(--text-tertiary)]">
                  adherence overall
                </div>
              </div>
            </div>
          </div>
          <div className="mt-7">
            <ProgressBar value={overallPct} thickness="sm" />
            <div className="mt-2 flex items-center justify-between font-mono text-[0.625rem] tabular-nums text-[var(--text-tertiary)]">
              <span>Day 1</span>
              <span>{Math.round(overallPct)}% of protocol elapsed</span>
              <span>Day {protocol.duration_days}</span>
            </div>
          </div>
        </Panel>

        {/* 30-day heatmap strip */}
        <Section
          kicker="Last 30 days"
          title="How you&rsquo;ve been holding."
          description="Each cell is a day. Saturation reflects % of non-negotiables completed."
        >
          <Panel className="p-5 md:p-7">
            <div className="flex items-center gap-1 md:gap-1.5 overflow-x-auto pb-2 -mb-2">
              {stripDays.map((d) => {
                const checkin = checkinsByDate.get(d.date);
                const completed = checkin?.completed_items.length ?? 0;
                const pct =
                  totalNN > 0 ? Math.min(100, (completed / totalNN) * 100) : 0;
                const heat = pct / 100;
                const fillAlpha =
                  d.inProtocol && !d.future ? 0.18 + heat * 0.7 : 0;
                return (
                  <div
                    key={d.date}
                    title={`${d.date} — ${completed}/${totalNN} (${Math.round(pct)}%)`}
                    className={cn(
                      "shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-[5px]",
                      d.inProtocol && !d.future && "border border-[var(--border-subtle)]",
                      d.inProtocol && d.future && "border border-dashed border-[var(--border-subtle)]",
                      !d.inProtocol && "border border-[var(--border-subtle)]/40 opacity-30",
                      d.isToday && "ring-1 ring-[var(--accent-base)]/70"
                    )}
                    style={{
                      backgroundColor:
                        fillAlpha > 0
                          ? `rgba(122,31,36,${fillAlpha})`
                          : "var(--bg-canvas)",
                    }}
                  />
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between font-mono text-[0.625rem] tabular-nums text-[var(--text-tertiary)]">
              <span>{stripDays[0]?.date ?? ""}</span>
              <Link
                href="/dashboard/calendar"
                className="hover:text-[var(--accent-base)] transition-colors inline-flex items-center gap-1"
              >
                Open calendar
                <ArrowRight size={11} strokeWidth={2} />
              </Link>
              <span>{stripDays[stripDays.length - 1]?.date ?? ""}</span>
            </div>
          </Panel>
        </Section>

        {/* Per-NN adherence */}
        <Section
          kicker="Non-negotiables"
          title="What&rsquo;s sticking and what&rsquo;s not."
          description="Each bar is one habit's adherence across days you've lived in the protocol."
        >
          <Panel className="p-6 md:p-7">
            <div className="space-y-4 md:space-y-5">
              {nnStats.map(({ nn, completed, pct }) => (
                <div
                  key={nn.id}
                  className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 md:gap-6 md:items-baseline"
                >
                  <div className="min-w-0">
                    <div className="font-serif text-[0.9375rem] md:text-[1rem] tracking-[-0.005em] text-[var(--text-primary)] truncate">
                      {nn.title}
                    </div>
                    <div className="mt-1.5">
                      <ProgressBar value={pct} thickness="sm" />
                    </div>
                  </div>
                  <div className="text-right shrink-0 font-mono text-[0.6875rem] tabular-nums text-[var(--text-tertiary)] uppercase tracking-[0.12em]">
                    <span className="text-[var(--text-secondary)]">
                      {completed}
                    </span>{" "}
                    / {elapsedDays} ·{" "}
                    <span className="text-[var(--text-secondary)]">{pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </Section>

        {/* Cut countdowns */}
        {parsed.cuts.length > 0 ? (
          <Section
            kicker="Cuts"
            title="What you&rsquo;re still holding."
            right={
              <Link
                href="/dashboard/cuts"
                className="inline-flex items-center gap-1.5 font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--text-secondary)] hover:text-[var(--accent-base)] transition-colors"
              >
                Open cuts
                <ArrowRight size={11} strokeWidth={2} />
              </Link>
            }
          >
            <Panel className="p-6 md:p-7">
              <div className="space-y-4 md:space-y-5">
                {parsed.cuts.map((cut) => {
                  const elapsed = Math.min(day, cut.abstinence_days);
                  const remaining = Math.max(0, cut.abstinence_days - elapsed);
                  const pct = (elapsed / cut.abstinence_days) * 100;
                  return (
                    <Link
                      key={cut.target}
                      href={`/dashboard/cuts?expand=${cutSlug(cut.target)}`}
                      className="block group"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-3 md:gap-6 md:items-baseline">
                        <div className="flex items-center gap-2 font-mono text-[0.625rem] tracking-[0.18em] uppercase text-[var(--accent-base)]">
                          <Lock size={10} strokeWidth={2} />
                          Active
                        </div>
                        <div className="min-w-0">
                          <div className="font-serif text-[1.0625rem] tracking-[-0.005em] text-[var(--text-primary)] group-hover:text-[var(--accent-base)] transition-colors">
                            {cut.target}
                          </div>
                          <div className="mt-1.5">
                            <ProgressBar value={pct} thickness="sm" />
                          </div>
                        </div>
                        <div className="text-right shrink-0 font-mono text-[0.6875rem] tabular-nums text-[var(--text-tertiary)] uppercase tracking-[0.12em]">
                          <span className="font-serif text-[1rem] text-[var(--text-primary)] tabular-nums normal-case tracking-normal">
                            {remaining}
                          </span>{" "}
                          days left
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </Panel>
          </Section>
        ) : null}

        {/* This week's focus */}
        {currentWeek ? (
          <Section
            kicker={`Week ${currentWeek.week_number}`}
            title="What it&rsquo;s about."
          >
            <Panel className="p-6 md:p-7">
              <p className="font-serif text-[1.0625rem] md:text-[1.125rem] leading-[1.4] tracking-[-0.005em] text-[var(--text-primary)] max-w-2xl">
                {currentWeek.focus}
              </p>
              <p className="mt-3 font-sans text-[0.9375rem] md:text-[1rem] leading-[1.65] text-[var(--text-secondary)] max-w-2xl">
                {currentWeek.expectation}
              </p>
            </Panel>
          </Section>
        ) : null}

        {/* Recent reflections */}
        {journalEntries.length > 0 ? (
          <Section
            kicker="Recent reflection"
            title="What you wrote."
            right={
              <Link
                href="/dashboard/journal"
                className="inline-flex items-center gap-1.5 font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--text-secondary)] hover:text-[var(--accent-base)] transition-colors"
              >
                Open journal
                <ArrowRight size={11} strokeWidth={2} />
              </Link>
            }
          >
            <div className="space-y-4">
              {journalEntries.map((c) => (
                <Link
                  key={c.id}
                  href={`/dashboard/journal?date=${c.date}`}
                  className="block"
                >
                  <Panel className="p-5 md:p-6 transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)]">
                    <div className="flex items-baseline justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2 font-mono text-[0.625rem] tracking-[0.18em] uppercase text-[var(--text-tertiary)]">
                        <Notebook size={10} strokeWidth={1.5} />
                        {formatShortDate(c.date)}
                      </div>
                      <div className="font-mono text-[0.625rem] tracking-[0.12em] uppercase text-[var(--text-tertiary)]">
                        Day {dayNumber(protocol.start_date, c.date)}
                      </div>
                    </div>
                    <p className="font-sans text-[0.9375rem] leading-[1.6] text-[var(--text-primary)] line-clamp-3">
                      {c.journal_text}
                    </p>
                  </Panel>
                </Link>
              ))}
            </div>
          </Section>
        ) : null}
      </DashboardPage>
    </DashboardLayout>
  );
}

function buildStripDays(startDate: string, today: string, count: number) {
  const start = new Date(`${startDate}T00:00:00Z`);
  const todayD = new Date(`${today}T00:00:00Z`);
  // Anchor strip on today: last `count` days ending today (inclusive)
  const days: Array<{
    date: string;
    inProtocol: boolean;
    future: boolean;
    isToday: boolean;
  }> = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(todayD.getTime() - i * 86400000);
    const iso = d.toISOString().split("T")[0];
    const inProtocol = d >= start;
    days.push({
      date: iso,
      inProtocol,
      future: false,
      isToday: iso === today,
    });
  }
  return days;
}

function getCurrentPhase(day: number, durationDays: number) {
  if (day <= 14) {
    return {
      label: "Substrate",
      headline: "You're laying the floor.",
      copy: "Sleep, sunlight, and the anchors. Days 1-14 will feel worse before they feel better — that's recalibration. The data says habit formation kicks in around weeks 3-4; you're earlier than that.",
    };
  }
  if (durationDays >= 60 && day <= 42) {
    return {
      label: "Body Reset",
      headline: "Movement enters.",
      copy: "Substrate is now running on its own. Body work compounds on the substrate, not in spite of it — if a workout breaks sleep, sleep wins.",
    };
  }
  if (durationDays >= 60) {
    return {
      label: "Mind Reset",
      headline: "What you do with the day changes.",
      copy: "Meditation, deep work, journaling. By here the substrate is automatic — the layer that's changing is what you choose to fill the day with.",
    };
  }
  return {
    label: "Body Reset",
    headline: "Movement enters.",
    copy: "Substrate is consolidated. Body work compounds on the substrate, not in spite of it.",
  };
}
