import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { resolveOwner } from "@/services/owner";
import {
  getActiveProtocol,
  getCheckinByDate,
  getCheckinsForProtocol,
} from "@/services/supabase/queries";
import { DashboardLayout, DashboardPage } from "@/components/layouts/DashboardLayout";
import { IdentityHeader } from "@/components/dashboard/IdentityHeader";
import { TodayCheckIn } from "@/components/dashboard/TodayCheckIn";
import { TodayJournal } from "@/components/dashboard/TodayJournal";
import { CutsStrip } from "@/components/dashboard/CutsStrip";
import { Panel } from "@/components/dashboard/Panel";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { Section } from "@/components/dashboard/Section";
import { Stat } from "@/components/dashboard/Stat";
import { parseProtocolData } from "@/lib/protocol/extract";
import { dayNumber, todayDateString, formatShortDate } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function DashboardTodayPage() {
  const owner = await resolveOwner();
  if (!owner) redirect("/diagnostic");

  const protocol = await getActiveProtocol(owner);
  if (!protocol) redirect("/diagnostic");

  const parsed = parseProtocolData(protocol.protocol_data);
  if (!parsed) {
    return (
      <DashboardLayout>
        <DashboardPage>
          <Panel className="p-7">
            <div className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--state-danger)] mb-2">
              Error
            </div>
            <h1 className="font-serif text-[1.5rem] mb-3 text-[var(--text-primary)]">
              Protocol data couldn&rsquo;t be parsed.
            </h1>
            <p className="font-sans text-[var(--text-secondary)]">
              The stored protocol failed schema validation. Please regenerate
              via the diagnostic.
            </p>
          </Panel>
        </DashboardPage>
      </DashboardLayout>
    );
  }

  const today = todayDateString();
  const todayCheckin = await getCheckinByDate(owner, today);
  const recentCheckins = await getCheckinsForProtocol(protocol.id);

  const day = dayNumber(protocol.start_date, today);
  const phaseLabel =
    day <= 14 ? "Foundation" : day <= 42 ? "Body Reset" : "Mind Reset";

  const totalNN = parsed.non_negotiables.length;
  const completedToday = todayCheckin?.completed_items.length ?? 0;
  const todayPct = totalNN > 0 ? (completedToday / totalNN) * 100 : 0;

  // Last 7 days completion %
  const last7 = recentCheckins.slice(0, 7);
  const last7Total = last7.reduce(
    (sum, c) => sum + Math.min(c.completed_items.length, totalNN),
    0
  );
  const last7Possible = Math.min(7, day) * totalNN;
  const last7Pct =
    last7Possible > 0 ? Math.round((last7Total / last7Possible) * 100) : 0;

  const daysRemaining = Math.max(0, protocol.duration_days - day + 1);

  return (
    <DashboardLayout>
      <IdentityHeader
        identityStatement={protocol.identity_statement}
        right={
          <div className="hidden md:flex items-center gap-3 font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--text-tertiary)]">
            <span>{formatShortDate(today)}</span>
            <span className="text-[var(--border-default)]">|</span>
            <span className="text-[var(--accent-base)]">{phaseLabel} Phase</span>
          </div>
        }
      />

      <DashboardPage>
        {/* Hero — today's progress + quick stats */}
        <Panel tone="hero" className="overflow-visible">
          <div className="px-6 md:px-10 py-7 md:py-9 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-7 md:gap-12 md:items-center">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
              <ProgressRing value={todayPct} size={110} label="Today" />
              <div className="space-y-2">
                <div className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--accent-base)]">
                  Day <span className="tabular-nums">{day}</span> of{" "}
                  <span className="tabular-nums">{protocol.duration_days}</span>
                </div>
                <div className="font-serif text-[1.5rem] md:text-[1.875rem] leading-tight tracking-[-0.02em] text-[var(--text-primary)]">
                  Today&rsquo;s foundation.
                </div>
                <div className="font-sans text-[0.9375rem] text-[var(--text-secondary)] max-w-md">
                  {completedToday === 0
                    ? "Nothing logged yet. Start with whichever's easiest."
                    : completedToday === totalNN
                      ? "All non-negotiables done. The day still has hours — go deeper."
                      : `${completedToday} of ${totalNN} logged. Keep going.`}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 md:gap-10 md:border-l md:border-[var(--border-subtle)] md:pl-12">
              <Stat
                value={`${last7Pct}%`}
                label="Last 7 days"
                meta="completion"
              />
              <Stat
                value={daysRemaining}
                label="Days left"
                meta="in protocol"
              />
            </div>
          </div>
        </Panel>

        {/* Today's non-negotiables */}
        <Section
          kicker="Today"
          title="Non-negotiables."
          description="Anchored to routines you already have. Tap to log."
          right={
            <Link
              href="/dashboard/foundation"
              className="inline-flex items-center gap-1.5 font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--text-secondary)] hover:text-[var(--accent-base)] transition-colors"
            >
              See full foundation
              <ArrowRight size={11} strokeWidth={2} />
            </Link>
          }
        >
          <Panel className="p-5 md:p-7">
            <TodayCheckIn
              protocolId={protocol.id}
              date={today}
              nonNegotiables={parsed.non_negotiables}
              initialCompleted={todayCheckin?.completed_items ?? []}
            />
          </Panel>

          <div className="mt-4">
            <TodayJournal
              protocolId={protocol.id}
              date={today}
              initialText={todayCheckin?.journal_text ?? ""}
            />
          </div>
        </Section>

        {/* Active cuts */}
        {parsed.cuts.length > 0 ? (
          <Section
            kicker="Cuts"
            title="What you&rsquo;re holding."
            description="Tap a cut to open the full plan."
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
            <CutsStrip cuts={parsed.cuts} dayInProtocol={day} />
          </Section>
        ) : null}
      </DashboardPage>
    </DashboardLayout>
  );
}
