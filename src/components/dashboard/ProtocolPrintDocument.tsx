"use client";

import { useEffect } from "react";
import type {
  DiagnosisCitation,
  DiagnosisData,
  Tier,
} from "@/services/supabase/types";
import type { Protocol } from "@/lib/protocol/types";
import { formatAnchor } from "@/lib/protocol/extract";

/**
 * The full protocol — diagnosis prose + cuts + non-negotiables + if-then
 * plans + week-by-week focus — typeset for paper. The artifact a user
 * actually saves. Auto-prints on mount.
 */
export function ProtocolPrintDocument({
  tier,
  durationDays,
  startDate,
  identityStatement,
  protocol,
  diagnosisData,
  diagnosisProse,
  generatedAt,
  autoPrint = false,
}: {
  tier: Tier;
  durationDays: 30 | 90;
  startDate: string;
  identityStatement: string | null;
  protocol: Protocol;
  diagnosisData: DiagnosisData | null;
  diagnosisProse: string;
  generatedAt: string;
  autoPrint?: boolean;
}) {
  useEffect(() => {
    if (!autoPrint) return;
    const t = setTimeout(() => {
      try {
        window.print();
      } catch {}
    }, 800);
    return () => clearTimeout(t);
  }, [autoPrint]);

  const tierTitle = tier === "operator" ? "Operator" : "Foundation";

  const proseParagraphs = (diagnosisData?.prose ?? diagnosisProse)
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const citationsById = new Map<number, DiagnosisCitation>();
  if (diagnosisData) {
    for (const c of diagnosisData.citations) citationsById.set(c.id, c);
  }

  return (
    <>
      <style jsx global>{`
        @page {
          size: A4;
          margin: 18mm 16mm 20mm 16mm;
        }
        @media print {
          html,
          body {
            background: #ffffff !important;
            color: #1a1612 !important;
            font-size: 10pt;
          }
          .pp-page {
            background: #ffffff !important;
            color: #1a1612 !important;
          }
          .pp-page * {
            color: inherit;
          }
          .pp-only-screen {
            display: none !important;
          }
          .pp-page-break {
            page-break-after: always;
            break-after: page;
          }
          .pp-no-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>

      <main className="pp-page min-h-screen bg-white text-[#1a1612] mx-auto max-w-[820px] px-10 py-12">
        {/* Cover */}
        <header className="border-y border-[#d6c7b8] py-3">
          <div className="flex items-center justify-between gap-3 text-[10px] tracking-[0.18em] uppercase text-[#6b1f24] font-mono">
            <span>Monk ModeX · {tierTitle} Protocol</span>
            <span className="tabular-nums text-[#8a7a6a]">
              {formatHeaderDate(generatedAt)}
            </span>
          </div>
          {identityStatement ? (
            <p className="mt-2 italic text-[12pt] leading-[1.5] text-[#5a4f44] font-serif">
              &ldquo;{identityStatement.replace(/^…|^\.\.\./, "").trim()}&rdquo;
            </p>
          ) : null}
        </header>

        <div className="mt-10 mb-12">
          <p className="text-[10px] tracking-[0.18em] uppercase font-mono text-[#6b1f24] mb-3">
            {durationDays}-day plan · started {formatHeaderDate(startDate)}
          </p>
          <h1 className="font-serif text-[30pt] leading-[1.05] tracking-[-0.022em] text-[#1a1612]">
            {diagnosisData?.headline ??
              "Your reward system, the read, and the protocol."}
          </h1>
        </div>

        {/* Diagnosis */}
        {proseParagraphs.length > 0 ? (
          <section className="pp-no-break">
            <h2 className="font-serif text-[16pt] leading-tight tracking-[-0.012em] text-[#1a1612] mb-5">
              Diagnosis
            </h2>
            <div className="space-y-3 max-w-[60ch]">
              {proseParagraphs.map((para, i) => (
                <p
                  key={i}
                  className="font-serif text-[11pt] leading-[1.6] text-[#1a1612]"
                >
                  {renderInline(para, citationsById)}
                </p>
              ))}
            </div>
          </section>
        ) : null}

        {/* Citations footer at bottom of cover (collapsed) */}
        {diagnosisData && diagnosisData.citations.length > 0 ? (
          <section className="mt-8 pt-5 border-t border-[#d6c7b8] pp-no-break">
            <p className="text-[9px] tracking-[0.18em] uppercase font-mono text-[#8a7a6a] mb-2">
              References
            </p>
            <ol className="space-y-1.5">
              {diagnosisData.citations.map((c) => (
                <li
                  key={c.id}
                  className="flex gap-3 text-[9pt] leading-[1.5] text-[#5a4f44]"
                >
                  <span className="font-mono tabular-nums shrink-0 text-[#8a7a6a]">
                    [{c.id}]
                  </span>
                  <span>
                    <span className="text-[#1a1612]">{c.author}</span>{" "}
                    ({c.year}). <span className="italic">{c.title}</span>
                    {c.journal ? `. ${c.journal}` : ""}.
                  </span>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <div className="pp-page-break" />

        {/* Non-negotiables */}
        <section className="pp-no-break">
          <p className="text-[10px] tracking-[0.18em] uppercase font-mono text-[#6b1f24] mb-2">
            Daily
          </p>
          <h2 className="font-serif text-[18pt] leading-tight tracking-[-0.012em] text-[#1a1612] mb-6">
            Non-negotiables
          </h2>
          <ol className="space-y-5">
            {protocol.non_negotiables.map((nn, i) => (
              <li key={nn.id} className="pp-no-break">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="font-mono tabular-nums text-[10pt] text-[#8a7a6a]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-serif text-[13pt] leading-[1.25] tracking-[-0.005em] text-[#1a1612]">
                    {nn.title}
                  </h3>
                </div>
                <p className="ml-7 italic font-serif text-[11pt] leading-[1.5] text-[#1a1612] mb-2">
                  &ldquo;{nn.tiny_action}&rdquo;
                </p>
                <p className="ml-7 text-[10pt] leading-[1.55] text-[#5a4f44] mb-2">
                  {nn.rationale}
                </p>
                <p className="ml-7 text-[9pt] leading-[1.5] text-[#8a7a6a] font-mono uppercase tracking-[0.12em]">
                  Anchor: {formatAnchor(nn.anchor)} · {nn.research_citation}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <div className="pp-page-break" />

        {/* Cuts */}
        {protocol.cuts.length > 0 ? (
          <section>
            <p className="text-[10px] tracking-[0.18em] uppercase font-mono text-[#6b1f24] mb-2">
              Separating from
            </p>
            <h2 className="font-serif text-[18pt] leading-tight tracking-[-0.012em] text-[#1a1612] mb-6">
              Cuts
            </h2>
            <div className="space-y-9">
              {protocol.cuts.map((cut, i) => (
                <div key={i} className="pp-no-break">
                  <h3 className="font-serif text-[14pt] leading-[1.2] tracking-[-0.012em] text-[#1a1612] mb-1">
                    {cut.target}
                    <span className="ml-3 text-[10pt] font-mono text-[#8a7a6a] tabular-nums uppercase tracking-[0.12em]">
                      {cut.abstinence_days} days
                    </span>
                  </h3>
                  <p className="text-[10pt] leading-[1.6] text-[#5a4f44] max-w-[60ch] mb-4">
                    {cut.rationale}
                  </p>

                  <p className="text-[9pt] tracking-[0.18em] uppercase font-mono text-[#6b1f24] mb-2">
                    Self-binding
                  </p>
                  <ol className="space-y-2 mb-4">
                    {cut.self_binding.map((s, j) => (
                      <li
                        key={j}
                        className="flex gap-3 text-[10pt] leading-[1.55] text-[#1a1612]"
                      >
                        <span className="font-mono tabular-nums shrink-0 text-[#8a7a6a]">
                          {j + 1}.
                        </span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ol>

                  <p className="text-[9pt] tracking-[0.18em] uppercase font-mono text-[#6b1f24] mb-2">
                    If-then plans
                  </p>
                  <ul className="space-y-3">
                    {cut.if_then_plans.map((p, j) => (
                      <li key={j} className="text-[10pt] leading-[1.55]">
                        <span className="font-mono uppercase tracking-[0.12em] text-[#8a7a6a] mr-2">
                          If
                        </span>
                        <span className="text-[#1a1612]">{p.trigger}</span>
                        <br />
                        <span className="font-mono uppercase tracking-[0.12em] text-[#8a7a6a] mr-2">
                          Then
                        </span>
                        <span className="text-[#1a1612]">{p.response}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <div className="pp-page-break" />

        {/* Weeks */}
        {protocol.weeks.length > 0 ? (
          <section>
            <p className="text-[10px] tracking-[0.18em] uppercase font-mono text-[#6b1f24] mb-2">
              Week by week
            </p>
            <h2 className="font-serif text-[18pt] leading-tight tracking-[-0.012em] text-[#1a1612] mb-6">
              The arc
            </h2>
            <ol className="space-y-5">
              {protocol.weeks.map((w) => (
                <li key={w.week_number} className="pp-no-break">
                  <p className="font-mono uppercase tracking-[0.12em] text-[9pt] text-[#8a7a6a] tabular-nums mb-1">
                    Week {w.week_number}
                  </p>
                  <h3 className="font-serif text-[12pt] leading-[1.3] tracking-[-0.005em] text-[#1a1612] mb-1">
                    {w.focus}
                  </h3>
                  <p className="text-[10pt] leading-[1.55] text-[#5a4f44] max-w-[60ch]">
                    {w.expectation}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {/* Notes */}
        <section className="mt-9 pt-6 border-t border-[#d6c7b8] pp-no-break">
          <p className="text-[10px] tracking-[0.18em] uppercase font-mono text-[#6b1f24] mb-2">
            Expectations
          </p>
          <p className="text-[10pt] leading-[1.65] text-[#1a1612] mb-5 max-w-[60ch]">
            {protocol.protocol_notes.expectations}
          </p>
          <p className="text-[10px] tracking-[0.18em] uppercase font-mono text-[#6b1f24] mb-2">
            If you lapse
          </p>
          <p className="text-[10pt] leading-[1.65] text-[#1a1612] max-w-[60ch]">
            {protocol.protocol_notes.lapse_handling}
          </p>
        </section>

        {/* Footer */}
        <div className="mt-10 flex items-center justify-between text-[9pt] font-mono uppercase tracking-[0.18em] text-[#8a7a6a]">
          <span>Monk ModeX</span>
          <span>monkmodex.com</span>
        </div>

        {/* Screen-only controls */}
        <div className="pp-only-screen mt-8 flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[6px] bg-[#6b1f24] hover:bg-[#7e242d] text-white text-[12px] tracking-[0.18em] uppercase font-mono"
          >
            Print or Save as PDF
          </button>
          <button
            type="button"
            onClick={() => window.close()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[6px] border border-[#d6c7b8] hover:bg-[#f6f0e7] text-[#1a1612] text-[12px] tracking-[0.18em] uppercase font-mono"
          >
            Close
          </button>
        </div>
      </main>
    </>
  );
}

function renderInline(
  text: string,
  citationsById: Map<number, DiagnosisCitation>
) {
  const parts = text.split(/(\[\d+\])/g);
  return parts.map((part, i) => {
    const m = part.match(/^\[(\d+)\]$/);
    if (m) {
      const id = Number(m[1]);
      const c = citationsById.get(id);
      const tooltip = c
        ? `${c.author} (${c.year}). ${c.title}.`
        : `Citation ${id}`;
      return (
        <sup
          key={i}
          title={tooltip}
          className="font-mono text-[7pt] tabular-nums text-[#6b1f24] mx-[1px]"
        >
          [{id}]
        </sup>
      );
    }
    return part;
  });
}

function formatHeaderDate(iso: string): string {
  return new Date(iso)
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
}
