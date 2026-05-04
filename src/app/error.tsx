"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Sentry hook will pick this up once wired
    console.error("Route error boundary:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--accent-base)] mb-3">
          Something broke
        </div>
        <h1 className="font-serif text-[1.875rem] md:text-[2.25rem] leading-[1.1] tracking-[-0.018em] text-[var(--text-primary)] mb-5">
          We hit a wall.
        </h1>
        <p className="font-sans text-[0.9375rem] md:text-[1rem] leading-[1.65] text-[var(--text-secondary)] mb-2">
          A page crashed. Refresh once — most of the time that&rsquo;s enough.
          If it keeps happening, the error has been logged on our side.
        </p>
        {error.digest ? (
          <p className="font-mono text-[0.6875rem] tabular-nums text-[var(--text-tertiary)] mb-9">
            ref: {error.digest}
          </p>
        ) : (
          <div className="mb-9" />
        )}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-[6px] bg-[var(--accent-base)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] font-mono text-[0.6875rem] tracking-[0.18em] uppercase transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-[6px] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-mono text-[0.6875rem] tracking-[0.18em] uppercase transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
