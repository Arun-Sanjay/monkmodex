import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Section — page-level header. Kicker + serif title + optional right slot.
 * Anchors a chunk of dashboard content. Quieter than a page H1.
 */
export function Section({
  kicker,
  title,
  right,
  description,
  children,
  className,
}: {
  kicker?: ReactNode;
  title?: ReactNode;
  right?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-5 md:space-y-6", className)}>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="min-w-0 space-y-2">
          {kicker ? (
            <div className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--accent-base)]">
              {kicker}
            </div>
          ) : null}
          {title ? (
            <h2 className="font-serif text-[1.5rem] md:text-[1.75rem] leading-[1.15] tracking-[-0.015em] text-[var(--text-primary)]">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="font-sans text-[0.9375rem] leading-[1.55] text-[var(--text-secondary)] max-w-2xl">
              {description}
            </p>
          ) : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      {children}
    </section>
  );
}
