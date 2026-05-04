import Link from "next/link";
import { PublicLayout } from "@/components/layouts/PublicLayout";

export const metadata = {
  title: "Not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <PublicLayout>
      <div className="max-w-xl mx-auto px-6 md:px-10 pt-24 md:pt-32 pb-16">
        <div className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--accent-base)] mb-3">
          404 · Not found
        </div>
        <h1 className="font-serif text-[2rem] md:text-[2.625rem] leading-[1.08] tracking-[-0.02em] text-[var(--text-primary)] mb-5">
          That page isn&rsquo;t here.
        </h1>
        <p className="font-sans text-[1rem] md:text-[1.0625rem] leading-[1.65] text-[var(--text-secondary)] max-w-prose mb-9">
          Either the URL is wrong, or it never existed. No deeper meaning.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-[6px] bg-[var(--accent-base)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] font-mono text-[0.6875rem] tracking-[0.18em] uppercase transition-colors"
          >
            Home
          </Link>
          <Link
            href="/diagnostic"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-[6px] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-mono text-[0.6875rem] tracking-[0.18em] uppercase transition-colors"
          >
            Take the diagnostic
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
