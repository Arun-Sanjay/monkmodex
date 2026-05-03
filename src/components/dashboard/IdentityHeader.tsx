import type { ReactNode } from "react";

/**
 * IdentityHeader — slim banner at the top of the dashboard. Quiet, serif,
 * italic. Optional right-side slot for date/phase chrome.
 */
export function IdentityHeader({
  identityStatement,
  right,
}: {
  identityStatement: string | null;
  right?: ReactNode;
}) {
  return (
    <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]/60 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-5 md:py-7 flex items-center justify-between gap-6">
        <div className="min-w-0">
          {identityStatement ? (
            <>
              <p className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--accent-base)]">
                I am becoming a person who
              </p>
              <p className="mt-1 font-serif text-[1.0625rem] md:text-[1.1875rem] leading-[1.4] text-[var(--text-primary)] italic truncate">
                {identityStatement.replace(/^…|^\.\.\./, "").trim()}
              </p>
            </>
          ) : (
            <p className="font-mono text-[0.75rem] tracking-[0.18em] uppercase text-[var(--text-tertiary)]">
              Operator
            </p>
          )}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
    </div>
  );
}
