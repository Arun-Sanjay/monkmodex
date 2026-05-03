import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Stat — a single number-with-label, used in metric grids.
 *   value: the number (rendered in Fraunces, tabular-nums)
 *   label: small mono uppercase
 *   meta:  optional finer note below
 */
export function Stat({
  value,
  label,
  meta,
  className,
  align = "left",
}: {
  value: ReactNode;
  label: ReactNode;
  meta?: ReactNode;
  className?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5",
        align === "center" ? "items-center text-center" : "items-start",
        className
      )}
    >
      <div className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--text-tertiary)] whitespace-nowrap">
        {label}
      </div>
      <div className="font-serif text-[1.75rem] md:text-[2rem] leading-none tracking-[-0.02em] text-[var(--text-primary)] tabular-nums">
        {value}
      </div>
      {meta ? (
        <div className="font-sans text-[0.8125rem] text-[var(--text-secondary)] whitespace-nowrap">
          {meta}
        </div>
      ) : null}
    </div>
  );
}
