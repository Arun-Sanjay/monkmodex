import { cn } from "@/lib/cn";

/**
 * ProgressRing — circular SVG progress indicator. Static, no animation
 * loop. Used for "today's completion %" and similar singular metrics.
 *
 * Sized via `size` prop (px). Stroke width and font scale with size.
 */
export function ProgressRing({
  value,
  max = 100,
  size = 96,
  thickness,
  label,
  className,
}: {
  value: number;
  max?: number;
  size?: number;
  thickness?: number;
  label?: string;
  className?: string;
}) {
  const stroke = thickness ?? Math.max(4, Math.round(size / 14));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const dash = (pct / 100) * circumference;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className
      )}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        {/* track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth={stroke}
        />
        {/* fill — only render when there is progress; linecap=round adds a
            visible cap at 0%, so we hide the stroke entirely below 1% */}
        {pct >= 1 ? (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--accent-base)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            style={{
              transition: "stroke-dasharray 500ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        ) : null}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none">
        <div className="flex items-baseline justify-center gap-[2px]">
          <span className="font-serif text-[1.625rem] leading-none tracking-[-0.025em] text-[var(--text-primary)] tabular-nums">
            {Math.round(pct)}
          </span>
          <span className="font-serif text-[0.875rem] leading-none text-[var(--text-secondary)]">
            %
          </span>
        </div>
        {label ? (
          <span className="mt-2 font-mono text-[0.5625rem] tracking-[0.18em] uppercase text-[var(--text-tertiary)]">
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
