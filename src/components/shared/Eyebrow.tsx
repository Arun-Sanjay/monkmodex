import { cn } from "@/lib/cn";

/**
 * Eyebrow — small accent label with a dot indicator.
 * Replaces the lime "introducing X" tag from the reference layout with the
 * MMX oxblood accent.
 */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 font-mono text-[0.75rem] tracking-[0.08em] uppercase text-[var(--accent-base)]",
        className
      )}
    >
      <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-[var(--accent-base)]">
        <span className="absolute inset-0 rounded-full bg-[var(--accent-base)] opacity-50 animate-ping" />
      </span>
      {children}
    </div>
  );
}
