"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Download } from "lucide-react";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import type { DiagnosisData, DiagnosisCitation } from "@/services/supabase/types";

const TYPEWRITER_CPS = 65; // chars per second; ~tasteful pace, faster than 20cps
const REVEAL_INTERVAL_MS = 1000 / TYPEWRITER_CPS;
const SEEN_PREFIX = "mmx:diagnosis-seen:";

/**
 * DiagnosisDocument — long-form layout for the AI-generated diagnosis.
 * Mono header, optional typewriter reveal, NYT-style pull-quotes inserted
 * between paragraphs, citation superscripts with hover popovers, and a
 * references footer. The same component is used on the post-quiz results
 * page and on the dashboard's persistent diagnosis page.
 */
export function DiagnosisDocument({
  data,
  generatedAt,
  identityStatement,
  responseId,
  typewriter = false,
  showDownload = true,
  className,
}: {
  data: DiagnosisData;
  generatedAt: string;
  identityStatement: string | null;
  responseId: string;
  typewriter?: boolean;
  showDownload?: boolean;
  className?: string;
}) {
  // Skip typewriter if the user has seen this diagnosis before in this
  // browser. Persisted in localStorage so the second view is instant.
  const seenKey = `${SEEN_PREFIX}${responseId}`;
  const [hasSeen, setHasSeen] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(seenKey) === "1";
    } catch {
      return false;
    }
  });

  const reducedMotion = useReducedMotion();
  const shouldTypewrite = typewriter && !hasSeen && !reducedMotion;

  const total = data.prose.length;
  const [revealed, setRevealed] = useState<number>(
    shouldTypewrite ? 0 : total
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Run the typewriter
  useEffect(() => {
    if (!shouldTypewrite) {
      setRevealed(total);
      return;
    }
    intervalRef.current = setInterval(() => {
      setRevealed((c) => {
        const next = c + 1;
        if (next >= total) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return total;
        }
        return next;
      });
    }, REVEAL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [shouldTypewrite, total]);

  // Mark as seen when complete
  useEffect(() => {
    if (revealed >= total && shouldTypewrite) {
      try {
        window.localStorage.setItem(seenKey, "1");
        setHasSeen(true);
      } catch {
        // storage disabled — no-op
      }
    }
  }, [revealed, total, shouldTypewrite, seenKey]);

  const skip = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRevealed(total);
  };

  const isComplete = revealed >= total;

  // Split prose into paragraphs and figure out where to drop in pull-quotes
  const paragraphs = useMemo(
    () => data.prose.split(/\n\n+/).map((p) => p.trim()).filter(Boolean),
    [data.prose]
  );
  const pullQuotePositions = useMemo(
    () => buildPullQuoteSlots(paragraphs.length, data.pull_quotes.length),
    [paragraphs.length, data.pull_quotes.length]
  );

  // Compute character offsets so we know which paragraph index is fully
  // revealed and which is mid-reveal.
  const offsets = useMemo(() => {
    const result: number[] = [];
    let cursor = 0;
    for (const p of paragraphs) {
      cursor += p.length;
      result.push(cursor);
      cursor += 2; // for the \n\n we trimmed
    }
    return result;
  }, [paragraphs]);

  const citationsById = useMemo(() => {
    const m = new Map<number, DiagnosisCitation>();
    for (const c of data.citations) m.set(c.id, c);
    return m;
  }, [data.citations]);

  return (
    <div className={cn("relative", className)}>
      {/* Mono header — anchors the document */}
      <div className="border-y border-[var(--border-subtle)] py-4 mb-10 md:mb-12">
        <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--text-tertiary)]">
          <span className="text-[var(--accent-base)]">
            Reward System Diagnosis
          </span>
          <span className="tabular-nums">{formatHeaderDate(generatedAt)}</span>
        </div>
        {identityStatement ? (
          <p className="mt-3 font-serif italic text-[1rem] md:text-[1.0625rem] leading-[1.5] text-[var(--text-secondary)]">
            &ldquo;{identityStatement.replace(/^…|^\.\.\./, "").trim()}&rdquo;
          </p>
        ) : null}
      </div>

      {/* Headline */}
      <h1 className="font-serif text-[1.875rem] md:text-[2.625rem] leading-[1.1] tracking-[-0.022em] text-[var(--text-primary)] max-w-3xl">
        {data.headline}
      </h1>

      {/* Prose with embedded pull-quotes, typewriter-revealed if enabled */}
      <article className="mt-9 md:mt-12 space-y-6 md:space-y-8">
        {paragraphs.map((para, i) => {
          const startOffset = i === 0 ? 0 : offsets[i - 1] + 2;
          const endOffset = offsets[i];
          const charsInThisPara = Math.max(0, Math.min(revealed - startOffset, para.length));
          const revealedFraction = charsInThisPara / Math.max(1, para.length);
          const partialReveal = revealed > startOffset && revealed < endOffset;
          const hidden = revealed <= startOffset;
          const visibleText = hidden
            ? ""
            : partialReveal
              ? para.slice(0, charsInThisPara)
              : para;

          // Determine if a pull-quote slot follows this paragraph
          const quoteIndex = pullQuotePositions.indexOf(i);
          const showQuote =
            quoteIndex >= 0 &&
            isPastParagraph(revealed, endOffset) &&
            data.pull_quotes[quoteIndex];

          return (
            <div key={i}>
              <p
                style={
                  {
                    // Subtle fade-in for partial paragraphs so partial words
                    // don't pop. We render full-text once revealed.
                    "--reveal": revealedFraction.toFixed(2),
                  } as CSSProperties
                }
                className={cn(
                  "font-sans text-[1.0625rem] md:text-[1.1875rem] leading-[1.65] tracking-[-0.005em] text-[var(--text-primary)] max-w-[58ch]",
                  hidden && "opacity-0"
                )}
              >
                {renderInlineWithCitations(visibleText, citationsById)}
                {partialReveal ? (
                  <span
                    className="inline-block w-[2px] h-[1em] align-middle bg-[var(--accent-base)] ml-1 animate-pulse"
                    aria-hidden
                  />
                ) : null}
              </p>

              {showQuote ? (
                <PullQuote text={data.pull_quotes[quoteIndex]} />
              ) : null}
            </div>
          );
        })}
      </article>

      {/* References footer */}
      {isComplete && data.citations.length > 0 ? (
        <footer className="mt-14 md:mt-20 pt-7 border-t border-[var(--border-subtle)]">
          <div className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--accent-base)] mb-4">
            References
          </div>
          <ol className="space-y-3 max-w-3xl">
            {data.citations.map((c) => (
              <li
                key={c.id}
                className="flex gap-4 font-sans text-[0.875rem] md:text-[0.9375rem] leading-[1.55] text-[var(--text-secondary)]"
              >
                <span
                  className="shrink-0 font-mono text-[0.75rem] tabular-nums text-[var(--text-tertiary)] mt-[2px]"
                  id={`cite-${c.id}`}
                >
                  [{c.id}]
                </span>
                <span>
                  <span className="text-[var(--text-primary)]">
                    {c.author}
                  </span>{" "}
                  ({c.year}).{" "}
                  <span className="italic">{c.title}</span>
                  {c.journal ? (
                    <>
                      .{" "}
                      <span className="text-[var(--text-tertiary)]">
                        {c.journal}
                      </span>
                    </>
                  ) : null}
                  {c.finding ? (
                    <>
                      {" — "}
                      <span className="text-[var(--text-tertiary)]">
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

      {/* Skip / Download controls */}
      <div className="mt-10 md:mt-12 flex flex-wrap items-center gap-4">
        {!isComplete ? (
          <button
            type="button"
            onClick={skip}
            className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase px-4 py-2.5 rounded-[6px] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Skip animation
          </button>
        ) : null}
        {isComplete && showDownload ? (
          <a
            href={`/diagnostic/results/${responseId}/print`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-mono text-[0.6875rem] tracking-[0.18em] uppercase px-4 py-2.5 rounded-[6px] bg-[var(--accent-base)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] transition-colors"
          >
            <Download size={12} strokeWidth={2} />
            Download PDF
          </a>
        ) : null}
      </div>
    </div>
  );
}

function PullQuote({ text }: { text: string }) {
  return (
    <blockquote className="my-10 md:my-14 max-w-3xl">
      <span
        aria-hidden
        className="block w-10 h-px bg-[var(--accent-base)] mb-5"
      />
      <p className="font-serif text-[1.5rem] md:text-[2.125rem] leading-[1.2] tracking-[-0.018em] text-[var(--text-primary)]">
        &ldquo;{text}&rdquo;
      </p>
    </blockquote>
  );
}

/**
 * Replace [N] citation markers in a string with interactive superscripts.
 */
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
      return (
        <CitationRef key={i} id={id} citation={citation} />
      );
    }
    return part;
  });
}

function CitationRef({
  id,
  citation,
}: {
  id: number;
  citation: DiagnosisCitation | undefined;
}) {
  const [open, setOpen] = useState(false);
  const tooltip = citation
    ? `${citation.author} (${citation.year}). ${citation.title}${
        citation.journal ? `. ${citation.journal}` : ""
      }${citation.finding ? ` — ${citation.finding}` : ""}.`
    : `Citation [${id}]`;

  return (
    <span className="relative inline-block align-baseline">
      <a
        href={`#cite-${id}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="align-super text-[0.6875em] font-mono tabular-nums text-[var(--accent-base)] hover:text-[var(--accent-hover)] cursor-pointer ml-[1px] mr-[1px]"
        title={tooltip}
      >
        [{id}]
      </a>
      {open && citation ? (
        <span
          role="tooltip"
          className="absolute z-30 left-1/2 -translate-x-1/2 top-full mt-1 w-72 max-w-[80vw] p-3 rounded-[8px] bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-lg text-[0.8125rem] leading-[1.5] text-[var(--text-primary)] font-sans tracking-normal"
        >
          <span className="block font-mono text-[0.625rem] tracking-[0.18em] uppercase text-[var(--accent-base)] mb-1.5">
            Reference {id}
          </span>
          <span className="block">
            <span className="text-[var(--text-primary)]">{citation.author}</span>{" "}
            ({citation.year}).{" "}
            <span className="italic">{citation.title}</span>
            {citation.journal ? (
              <>
                .{" "}
                <span className="text-[var(--text-secondary)]">
                  {citation.journal}
                </span>
              </>
            ) : null}
            .
          </span>
          {citation.finding ? (
            <span className="mt-2 block text-[var(--text-secondary)]">
              {citation.finding}
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}

/**
 * Compute paragraph indexes after which a pull-quote should be inserted.
 * Returns up to `quoteCount` indexes, evenly distributed across the
 * paragraph array. We don't insert one after the last paragraph (the
 * references / next section already provide closure there).
 */
function buildPullQuoteSlots(paragraphCount: number, quoteCount: number): number[] {
  if (paragraphCount < 2 || quoteCount === 0) return [];
  // Slots are indexes 0..(paragraphCount - 2). Distribute quotes evenly.
  const slots: number[] = [];
  const usable = paragraphCount - 1;
  const k = Math.min(quoteCount, usable);
  for (let i = 1; i <= k; i++) {
    const idx = Math.max(0, Math.round((i * usable) / (k + 1)) - 1);
    if (!slots.includes(idx)) slots.push(idx);
  }
  return slots;
}

function isPastParagraph(revealed: number, endOffset: number): boolean {
  return revealed >= endOffset;
}

function stripTrailingPeriod(s: string): string {
  return s.replace(/\.\s*$/, "");
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
