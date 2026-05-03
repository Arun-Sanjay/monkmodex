import { cn } from "@/lib/cn";

/**
 * ProgressBar — linear oxblood fill on a warm-charcoal track. Static (no
 * shimmer animation) per the anti-supernormal-stimulus rule. The bar is
 * the data, not a celebration.
 */
export function ProgressBar({
  value,
  max = 100,
  thickness = "md",
  className,
  tone = "accent",
}: {
  value: number;
  max?: number;
  thickness?: "sm" | "md" | "lg";
  className?: string;
  tone?: "accent" | "muted";
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const h = thickness === "sm" ? "h-1" : thickness === "lg" ? "h-2.5" : "h-1.5";
  const fill =
    tone === "accent"
      ? "bg-[var(--accent-base)]"
      : "bg-[var(--text-tertiary)]";

  return (
    <div
      className={cn(
        "w-full rounded-full bg-[var(--bg-inset)] border border-[var(--border-subtle)] overflow-hidden",
        h,
        className
      )}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className={cn("h-full transition-[width] duration-500 ease-out", fill)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
