"use client";

import { useEffect, useMemo } from "react";
import type {
  DiagnosisCitation,
  DiagnosisData,
} from "@/services/supabase/types";

/**
 * DiagnosisPrintDocument — paper-tuned typesetting for the user's diagnosis.
 * Renders standalone (no nav, no chrome), auto-triggers window.print() on
 * mount. The user saves as PDF via the browser's print dialog. Pure CSS
 * layout — works without any PDF dependency.
 */
export function DiagnosisPrintDocument({
  data,
  fallbackProse,
  generatedAt,
  identityStatement,
  autoPrint = false,
}: {
  data: DiagnosisData | null;
  fallbackProse: string;
  generatedAt: string;
  identityStatement: string | null;
  autoPrint?: boolean;
}) {
  // Trigger the print dialog once the page settles.
  useEffect(() => {
    if (!autoPrint) return;
    const t = setTimeout(() => {
      try {
        window.print();
      } catch {
        // ignore
      }
    }, 600);
    return () => clearTimeout(t);
  }, [autoPrint]);

  const paragraphs = useMemo(() => {
    const text = data?.prose ?? fallbackProse;
    return text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  }, [data, fallbackProse]);

  const citationsById = useMemo(() => {
    const m = new Map<number, DiagnosisCitation>();
    if (data) for (const c of data.citations) m.set(c.id, c);
    return m;
  }, [data]);

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
          .print-page {
            background: #ffffff;
            color: #1a1612;
          }
          .print-page * {
            color: inherit;
          }
          .print-only-hide {
            display: none !important;
          }
          .print-mono {
            color: #6b1f24 !important;
          }
          .print-accent {
            color: #6b1f24 !important;
          }
          .print-rule {
            border-color: #d6c7b8 !important;
          }
          .print-soft-rule {
            background: #d6c7b8 !important;
          }
          .print-muted {
            color: #5a4f44 !important;
          }
          .print-tertiary {
            color: #8a7a6a !important;
          }
          .print-page .print-pull-line {
            background: #6b1f24 !important;
          }
        }
      `}</style>

      <main className="print-page min-h-screen bg-white text-[#1a1612] mx-auto max-w-[820px] px-10 py-12">
        {/* Header */}
        <header className="border-y print-rule border-[#d6c7b8] py-3">
          <div className="flex items-center justify-between gap-3 text-[10px] tracking-[0.18em] uppercase font-mono print-mono text-[#6b1f24]">
            <span>Reward System Diagnosis</span>
            <span className="tabular-nums print-tertiary text-[#8a7a6a]">
              {formatHeaderDate(generatedAt)}
            </span>
          </div>
          {identityStatement ? (
            <p className="mt-2 font-serif italic text-[12pt] leading-[1.5] print-muted text-[#5a4f44]">
              &ldquo;{identityStatement.replace(/^…|^\.\.\./, "").trim()}&rdquo;
            </p>
          ) : null}
        </header>

        {/* Headline */}
        {data?.headline ? (
          <h1 className="mt-8 font-serif text-[26pt] leading-[1.12] tracking-[-0.018em] text-[#1a1612] max-w-[20em]">
            {data.headline}
          </h1>
        ) : (
          <h1 className="mt-8 font-serif text-[24pt] leading-[1.1] tracking-[-0.018em]">
            Reward system diagnosis
          </h1>
        )}

        {/* Body */}
        <article className="mt-7 space-y-4">
          {paragraphs.map((para, i) => {
            // Insert pull quotes evenly between paragraphs
            const quoteSlot = data ? pickQuoteFor(i, paragraphs.length, data.pull_quotes.length) : -1;
            return (
              <div key={i}>
                <p className="font-serif text-[12pt] leading-[1.6] text-[#1a1612] max-w-[60ch]">
                  {renderInlineWithCitations(para, citationsById)}
                </p>
                {data && quoteSlot >= 0 ? (
                  <PrintPullQuote text={data.pull_quotes[quoteSlot]} />
                ) : null}
              </div>
            );
          })}
        </article>

        {/* References */}
        {data && data.citations.length > 0 ? (
          <footer className="mt-10 pt-5 border-t print-rule border-[#d6c7b8]">
            <div className="text-[10px] tracking-[0.18em] uppercase font-mono print-accent text-[#6b1f24] mb-3">
              References
            </div>
            <ol className="space-y-2">
              {data.citations.map((c) => (
                <li
                  key={c.id}
                  className="flex gap-3 text-[10pt] leading-[1.5] print-muted text-[#5a4f44]"
                >
                  <span className="shrink-0 font-mono tabular-nums print-tertiary text-[#8a7a6a]">
                    [{c.id}]
                  </span>
                  <span>
                    <span className="text-[#1a1612]">{c.author}</span>{" "}
                    ({c.year}). <span className="italic">{c.title}</span>
                    {c.journal ? (
                      <>
                        .{" "}
                        <span className="print-tertiary text-[#8a7a6a]">
                          {c.journal}
                        </span>
                      </>
                    ) : null}
                    {c.finding ? (
                      <>
                        {" — "}
                        <span className="print-tertiary text-[#8a7a6a]">
                          {stripTrailingPeriod(c.finding)}
                        </span>
                      </>
                    ) : null}
                    .
                  </span>
                </li>
              ))}
            </ol>
          </footer>
        ) : null}

        {/* Footer credit */}
        <div className="mt-10 flex items-center justify-between text-[9pt] font-mono tracking-[0.18em] uppercase print-tertiary text-[#8a7a6a]">
          <span>Monk ModeX</span>
          <span className="tabular-nums">monkmodex.com</span>
        </div>

        {/* Print/Back controls — hidden in print, visible on screen */}
        <div className="mt-8 print-only-hide flex items-center gap-3">
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

function PrintPullQuote({ text }: { text: string }) {
  return (
    <blockquote className="my-6 ml-0">
      <span
        aria-hidden
        className="block w-8 h-px print-soft-rule print-pull-line bg-[#6b1f24] mb-2"
      />
      <p className="font-serif italic text-[14pt] leading-[1.3] tracking-[-0.005em] text-[#1a1612] max-w-[28em]">
        &ldquo;{text}&rdquo;
      </p>
    </blockquote>
  );
}

function renderInlineWithCitations(
  text: string,
  citationsById: Map<number, DiagnosisCitation>
): React.ReactNode {
  if (!text) return null;
  const parts = text.split(/(\[\d+\])/g);
  return parts.map((part, i) => {
    const m = part.match(/^\[(\d+)\]$/);
    if (m) {
      const id = Number(m[1]);
      const citation = citationsById.get(id);
      const tooltip = citation
        ? `${citation.author} (${citation.year}). ${citation.title}.`
        : "";
      return (
        <sup
          key={i}
          title={tooltip}
          className="font-mono text-[7pt] tabular-nums print-accent text-[#6b1f24] mx-[1px]"
        >
          [{id}]
        </sup>
      );
    }
    return part;
  });
}

function pickQuoteFor(paraIdx: number, totalParas: number, totalQuotes: number): number {
  if (totalQuotes === 0 || totalParas < 2) return -1;
  // Distribute quotes evenly: place after paragraph at indexes
  // floor((i+1) * (totalParas - 1) / (totalQuotes + 1))
  for (let i = 0; i < totalQuotes; i++) {
    const pos = Math.max(
      0,
      Math.floor(((i + 1) * (totalParas - 1)) / (totalQuotes + 1))
    );
    if (pos === paraIdx) return i;
  }
  return -1;
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

function stripTrailingPeriod(s: string): string {
  return s.replace(/\.\s*$/, "");
}
