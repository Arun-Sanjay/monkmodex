import { cn } from "@/lib/cn";

/**
 * SectionGlow — soft top-corner washes scoped to a section. Lighter than
 * AmbientBackground so it stacks cleanly on top. Use on sections that need
 * their own visual "lift" (e.g. CTA, stats) rather than relying solely on
 * the global ambient layer.
 *
 * `tone="warm"` is the default oxblood. `tone="hush"` is the warm-charcoal
 * version for sections where oxblood would overheat the page.
 */
export function SectionGlow({
  tone = "warm",
  intensity = 1,
  className,
}: {
  tone?: "warm" | "hush";
  intensity?: number;
  className?: string;
}) {
  const left =
    tone === "warm"
      ? `radial-gradient(ellipse 55% 50% at 8% 0%, rgba(122,31,36,${0.16 * intensity}), transparent 55%)`
      : `radial-gradient(ellipse 55% 50% at 8% 0%, rgba(150,120,95,${0.07 * intensity}), transparent 55%)`;
  const right =
    tone === "warm"
      ? `radial-gradient(ellipse 50% 45% at 95% 0%, rgba(150,120,95,${0.07 * intensity}), transparent 55%)`
      : `radial-gradient(ellipse 50% 45% at 95% 0%, rgba(122,31,36,${0.07 * intensity}), transparent 55%)`;

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-0", className)}
    >
      <div className="absolute inset-0" style={{ background: left }} />
      <div className="absolute inset-0" style={{ background: right }} />
    </div>
  );
}
