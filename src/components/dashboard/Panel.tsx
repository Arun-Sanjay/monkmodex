import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Panel — base surface for dashboard content. Three tones:
 *   - hero: brighter inner gradient, oxblood-tinted, used for the day's
 *     centerpiece (Today's progress, identity statement).
 *   - default: standard surface for sectioned content.
 *   - subtle: dimmer, for secondary/reference panels.
 */
export function Panel({
  tone = "default",
  className,
  children,
  as: Tag = "div",
}: {
  tone?: "hero" | "default" | "subtle";
  className?: string;
  children: ReactNode;
  as?: "div" | "section" | "article";
}) {
  const styles =
    tone === "hero"
      ? "bg-gradient-to-b from-[var(--bg-elevated)] to-[var(--bg-surface)] border-[var(--border-default)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_2px_12px_rgba(0,0,0,0.3)]"
      : tone === "subtle"
        ? "bg-[var(--bg-surface)]/70 border-[var(--border-subtle)]"
        : "bg-[var(--bg-surface)] border-[var(--border-subtle)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]";

  return (
    <Tag
      className={cn(
        "rounded-[10px] border overflow-hidden",
        styles,
        className
      )}
    >
      {children}
    </Tag>
  );
}

export function PanelHeader({
  kicker,
  title,
  right,
  className,
}: {
  kicker?: ReactNode;
  title?: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "px-6 md:px-7 pt-5 md:pt-6 pb-4 flex items-start justify-between gap-4",
        className
      )}
    >
      <div className="min-w-0">
        {kicker ? (
          <div className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--text-tertiary)] mb-1.5">
            {kicker}
          </div>
        ) : null}
        {title ? (
          <h3 className="font-serif text-[1.125rem] md:text-[1.25rem] leading-[1.25] tracking-[-0.01em] text-[var(--text-primary)]">
            {title}
          </h3>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

export function PanelBody({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("px-6 md:px-7 pb-6 md:pb-7", className)}>{children}</div>;
}

export function PanelDivider() {
  return <div className="h-px bg-[var(--border-subtle)]" />;
}
