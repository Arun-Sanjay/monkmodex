"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, Shield, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Cut } from "@/lib/protocol/types";
import { Panel, PanelBody, PanelDivider } from "./Panel";
import { ProgressBar } from "./ProgressBar";
import { cutSlug } from "./CutsStrip";
import { LapseLogger } from "./LapseLogger";

/**
 * CutsGrid — 2x2 layout of cut cells. Click a cell to expand it across
 * both columns; the expanded cell shows rationale + self-binding + if-then
 * plans inline. URL `?expand=<slug>` deep-links from the Today cuts strip.
 */
export function CutsGrid({
  cuts,
  dayInProtocol,
  protocolId,
}: {
  cuts: Cut[];
  dayInProtocol: number;
  protocolId: string;
}) {
  const params = useSearchParams();
  const router = useRouter();
  const expandFromUrl = params.get("expand");
  const [expandedSlug, setExpandedSlug] = useState<string | null>(expandFromUrl);

  useEffect(() => {
    setExpandedSlug(expandFromUrl);
  }, [expandFromUrl]);

  const cells: Array<{ cut: Cut; slug: string } | null> = Array.from(
    { length: Math.max(4, cuts.length) },
    (_, i) => {
      const cut = cuts[i];
      return cut ? { cut, slug: cutSlug(cut.target) } : null;
    }
  );

  const setExpanded = (slug: string | null) => {
    setExpandedSlug(slug);
    router.replace(slug ? `/dashboard/cuts?expand=${slug}` : "/dashboard/cuts", {
      scroll: false,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
      {cells.map((cell, i) => {
        if (!cell) {
          return <EmptyCell key={`empty-${i}`} />;
        }
        const expanded = expandedSlug === cell.slug;
        return (
          <div key={cell.slug} className={cn(expanded && "md:col-span-2")}>
            {expanded ? (
              <ExpandedCard
                cut={cell.cut}
                dayInProtocol={dayInProtocol}
                protocolId={protocolId}
                onCollapse={() => setExpanded(null)}
              />
            ) : (
              <CollapsedCard
                cut={cell.cut}
                dayInProtocol={dayInProtocol}
                onExpand={() => setExpanded(cell.slug)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function CollapsedCard({
  cut,
  dayInProtocol,
  onExpand,
}: {
  cut: Cut;
  dayInProtocol: number;
  onExpand: () => void;
}) {
  const elapsed = Math.min(dayInProtocol, cut.abstinence_days);
  const remaining = Math.max(0, cut.abstinence_days - elapsed);
  const pct = (elapsed / cut.abstinence_days) * 100;
  return (
    <button
      type="button"
      onClick={onExpand}
      className="group w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-canvas)] rounded-[8px]"
    >
      <Panel
        tone="default"
        className="p-6 md:p-7 transition-colors duration-150 group-hover:border-[var(--border-strong)] group-hover:bg-[var(--bg-elevated)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 font-mono text-[0.625rem] tracking-[0.18em] uppercase text-[var(--accent-base)] mb-2">
              <Lock size={11} strokeWidth={2} />
              Active cut
            </div>
            <div className="font-serif text-[1.5rem] md:text-[1.625rem] leading-tight tracking-[-0.015em] text-[var(--text-primary)]">
              {cut.target}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-serif text-[2rem] leading-none tracking-[-0.02em] text-[var(--text-primary)] tabular-nums">
              {remaining}
            </div>
            <div className="mt-1 font-mono text-[0.625rem] tracking-[0.12em] uppercase text-[var(--text-tertiary)]">
              days remaining
            </div>
          </div>
        </div>

        <div className="mt-6">
          <ProgressBar value={pct} thickness="sm" />
          <div className="mt-2 flex items-center justify-between font-mono text-[0.6875rem] tabular-nums text-[var(--text-tertiary)]">
            <span>day {elapsed}</span>
            <span>of {cut.abstinence_days}</span>
          </div>
        </div>

        <div className="mt-6 font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--text-secondary)] group-hover:text-[var(--accent-base)] transition-colors duration-150">
          Tap to open plan →
        </div>
      </Panel>
    </button>
  );
}

function ExpandedCard({
  cut,
  dayInProtocol,
  protocolId,
  onCollapse,
}: {
  cut: Cut;
  dayInProtocol: number;
  protocolId: string;
  onCollapse: () => void;
}) {
  const elapsed = Math.min(dayInProtocol, cut.abstinence_days);
  const remaining = Math.max(0, cut.abstinence_days - elapsed);
  const pct = (elapsed / cut.abstinence_days) * 100;

  return (
    <Panel tone="hero" className="overflow-hidden">
      <div className="px-6 md:px-9 pt-6 md:pt-7 pb-5 md:pb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 font-mono text-[0.625rem] tracking-[0.18em] uppercase text-[var(--accent-base)] mb-2">
              <Lock size={11} strokeWidth={2} />
              Active cut
            </div>
            <div className="font-serif text-[1.75rem] md:text-[2rem] leading-tight tracking-[-0.018em] text-[var(--text-primary)]">
              {cut.target}
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="text-right">
              <div className="font-serif text-[2.25rem] md:text-[2.5rem] leading-none tracking-[-0.02em] text-[var(--text-primary)] tabular-nums">
                {remaining}
              </div>
              <div className="mt-1 font-mono text-[0.625rem] tracking-[0.12em] uppercase text-[var(--text-tertiary)]">
                days remaining
              </div>
            </div>
            <button
              type="button"
              onClick={onCollapse}
              aria-label="Collapse"
              className="shrink-0 w-8 h-8 rounded-full border border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={14} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <div className="mt-6 max-w-2xl">
          <ProgressBar value={pct} thickness="md" />
          <div className="mt-2 flex items-center justify-between font-mono text-[0.6875rem] tabular-nums text-[var(--text-tertiary)]">
            <span>day {elapsed}</span>
            <span>of {cut.abstinence_days}</span>
          </div>
        </div>

        <p className="mt-7 font-sans text-[0.9375rem] md:text-[1rem] leading-[1.65] text-[var(--text-secondary)] max-w-2xl">
          {cut.rationale}
        </p>
      </div>

      <PanelDivider />

      <PanelBody className="pt-6 md:pt-7">
        <div className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--accent-base)] mb-4 inline-flex items-center gap-2">
          <Shield size={11} strokeWidth={2} />
          Self-binding
        </div>
        <ol className="space-y-3 max-w-2xl">
          {cut.self_binding.map((s, j) => (
            <li key={j} className="flex gap-4 items-start">
              <span className="shrink-0 w-6 h-6 rounded-[5px] bg-[var(--bg-canvas)] border border-[var(--border-subtle)] font-mono text-[0.6875rem] flex items-center justify-center text-[var(--text-secondary)] tabular-nums">
                {j + 1}
              </span>
              <span className="font-sans text-[0.9375rem] md:text-[1rem] leading-[1.55] text-[var(--text-primary)]">
                {s}
              </span>
            </li>
          ))}
        </ol>
      </PanelBody>

      <PanelDivider />

      <PanelBody className="pt-6 md:pt-7">
        <div className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--accent-base)] mb-4 inline-flex items-center gap-2">
          <Lock size={11} strokeWidth={2} />
          If-then plans
        </div>
        <div className="space-y-3 max-w-3xl">
          {cut.if_then_plans.map((p, j) => (
            <div
              key={j}
              className="rounded-[8px] bg-[var(--bg-canvas)] border border-[var(--border-subtle)] overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] divide-y md:divide-y-0 md:divide-x divide-[var(--border-subtle)]">
                <div className="px-4 py-3 md:py-4 font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--accent-base)] md:text-center md:flex md:items-center md:justify-center">
                  If
                </div>
                <div className="px-4 py-3 md:py-4 font-sans text-[0.9375rem] md:text-[1rem] leading-[1.5] text-[var(--text-primary)]">
                  {p.trigger}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] border-t border-[var(--border-subtle)] divide-y md:divide-y-0 md:divide-x divide-[var(--border-subtle)]">
                <div className="px-4 py-3 md:py-4 font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--accent-base)] md:text-center md:flex md:items-center md:justify-center">
                  Then
                </div>
                <div className="px-4 py-3 md:py-4 font-sans text-[0.9375rem] md:text-[1rem] leading-[1.5] text-[var(--text-primary)]">
                  {p.response}
                </div>
              </div>
            </div>
          ))}
        </div>
      </PanelBody>

      <PanelDivider />

      <PanelBody className="pt-6 md:pt-7">
        <LapseLogger protocolId={protocolId} cutTarget={cut.target} />
      </PanelBody>
    </Panel>
  );
}

function EmptyCell() {
  return (
    <Panel
      tone="subtle"
      className="p-6 md:p-7 border-dashed flex flex-col items-start justify-center min-h-[180px]"
    >
      <div className="font-mono text-[0.625rem] tracking-[0.18em] uppercase text-[var(--text-tertiary)] mb-2">
        Empty slot
      </div>
      <p className="font-sans text-[0.875rem] leading-[1.5] text-[var(--text-tertiary)] max-w-[28ch]">
        Cuts are scoped at protocol generation. One drug of choice at a time
        beats trying to fix everything.
      </p>
    </Panel>
  );
}
