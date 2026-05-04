import type { ReactNode } from "react";
import { PublicLayout } from "@/components/layouts/PublicLayout";

/**
 * Shared layout for /terms, /privacy, /refund, /medical-disclaimer.
 * Sets a quiet mono kicker, large serif title, narrow reading column.
 */
export function LegalLayout({
  kicker,
  title,
  effective,
  children,
}: {
  kicker: string;
  title: string;
  effective?: string; // ISO date the document took effect
  children: ReactNode;
}) {
  return (
    <PublicLayout>
      <article className="max-w-2xl mx-auto px-6 md:px-10 pt-24 md:pt-32 pb-20">
        <div className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--accent-base)] mb-3">
          {kicker}
        </div>
        <h1 className="font-serif text-[2rem] md:text-[2.625rem] leading-[1.08] tracking-[-0.02em] text-[var(--text-primary)] mb-3">
          {title}
        </h1>
        {effective ? (
          <p className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--text-tertiary)] tabular-nums mb-10">
            Effective {formatLong(effective)}
          </p>
        ) : (
          <div className="mb-10" />
        )}
        <div className="legal-prose">{children}</div>
      </article>
    </PublicLayout>
  );
}

/**
 * Section heading inside a legal doc. Use `<LegalSection title="…" />` or
 * `<h2 className="legal-h2">…</h2>` directly.
 */
export function LegalSection({
  number,
  title,
  children,
}: {
  number?: string | number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10 first:mt-0">
      <div className="flex items-baseline gap-3 mb-4">
        {number !== undefined ? (
          <span className="font-mono text-[0.75rem] tabular-nums tracking-[0.12em] uppercase text-[var(--text-tertiary)]">
            §{number}
          </span>
        ) : null}
        <h2 className="font-serif text-[1.375rem] md:text-[1.5rem] leading-[1.2] tracking-[-0.012em] text-[var(--text-primary)]">
          {title}
        </h2>
      </div>
      <div className="space-y-4 font-sans text-[0.9375rem] md:text-[1rem] leading-[1.65] text-[var(--text-secondary)]">
        {children}
      </div>
    </section>
  );
}

function formatLong(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
