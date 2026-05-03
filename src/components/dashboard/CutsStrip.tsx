import Link from "next/link";
import { ArrowUpRight, Lock } from "lucide-react";
import type { Cut } from "@/lib/protocol/types";
import { Panel } from "./Panel";
import { ProgressBar } from "./ProgressBar";

/**
 * CutsStrip — clickable summaries of active cuts. Each card links to the
 * Cuts page with `?expand=<slug>` so the matching cut opens automatically.
 */
export function CutsStrip({
  cuts,
  dayInProtocol,
}: {
  cuts: Cut[];
  dayInProtocol: number;
}) {
  if (!cuts.length) return null;
  const gridCls =
    cuts.length === 1
      ? "grid grid-cols-1 gap-3 md:gap-4"
      : cuts.length === 2
        ? "grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4"
        : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4";
  return (
    <div className={gridCls}>
      {cuts.map((cut) => {
        const elapsed = Math.min(dayInProtocol, cut.abstinence_days);
        const remaining = Math.max(0, cut.abstinence_days - elapsed);
        const pct = (elapsed / cut.abstinence_days) * 100;
        const slug = cutSlug(cut.target);
        return (
          <Link
            key={cut.target}
            href={`/dashboard/cuts?expand=${slug}`}
            className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-canvas)] rounded-[8px]"
            aria-label={`Open ${cut.target} cut`}
          >
            <Panel
              tone="subtle"
              className="p-5 transition-colors duration-150 group-hover:border-[var(--border-strong)] group-hover:bg-[var(--bg-elevated)]"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 font-mono text-[0.625rem] tracking-[0.18em] uppercase text-[var(--accent-base)] mb-1.5">
                    <Lock size={10} strokeWidth={2} />
                    Cut
                  </div>
                  <div className="font-serif text-[1.0625rem] leading-tight tracking-[-0.005em] text-[var(--text-primary)]">
                    {cut.target}
                  </div>
                </div>
                <div className="flex items-start gap-3 shrink-0">
                  <div className="text-right">
                    <div className="font-serif text-[1.5rem] leading-none tracking-[-0.02em] text-[var(--text-primary)] tabular-nums">
                      {remaining}
                    </div>
                    <div className="mt-0.5 font-mono text-[0.625rem] tracking-[0.12em] uppercase text-[var(--text-tertiary)]">
                      days left
                    </div>
                  </div>
                  <ArrowUpRight
                    size={14}
                    strokeWidth={1.5}
                    className="mt-1 text-[var(--text-tertiary)] transition-colors duration-150 group-hover:text-[var(--accent-base)]"
                  />
                </div>
              </div>
              <ProgressBar value={pct} thickness="sm" />
              <div className="mt-2 flex items-center justify-between font-mono text-[0.6875rem] tabular-nums text-[var(--text-tertiary)]">
                <span>day {elapsed}</span>
                <span>of {cut.abstinence_days}</span>
              </div>
            </Panel>
          </Link>
        );
      })}
    </div>
  );
}

export function cutSlug(target: string): string {
  return target
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
