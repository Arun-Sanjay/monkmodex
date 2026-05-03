import Link from "next/link";
import { SECTION_NAMES } from "@/lib/quiz/schema";

export function QuizProgress({ section }: { section: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-6">
        <Link
          href="/"
          className="font-serif text-[1rem] tracking-[-0.01em] text-[var(--text-primary)] hover:text-[var(--accent-base)] transition-colors"
        >
          MMX
        </Link>
        <div className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--text-tertiary)]">
          Section <span className="text-[var(--text-secondary)] tabular-nums">{section}</span>
          <span className="mx-1.5 text-[var(--border-default)]">/</span>
          <span className="tabular-nums">5</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className="flex-1 h-[3px] rounded-full overflow-hidden bg-[var(--border-subtle)]"
          >
            <div
              className="h-full bg-[var(--accent-base)] transition-[width] duration-500"
              style={{
                width: s < section ? "100%" : s === section ? "50%" : "0%",
              }}
            />
          </div>
        ))}
      </div>

      <div className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--accent-base)]">
        {SECTION_NAMES[section]}
      </div>
    </div>
  );
}
