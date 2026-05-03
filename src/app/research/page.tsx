import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Display, Body, Meta } from "@/components/shared/Type";
import { ARTICLES } from "@/content/research";

export const metadata = {
  title: "Bullshit Detector — Monk ModeX",
  description:
    "Evidence-based rebuttals to popular self-improvement claims. The receipts behind the protocol.",
};

export default function ResearchIndexPage() {
  return (
    <PublicLayout>
      <section className="max-w-4xl mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-12">
        <Meta className="mb-3">The Bullshit Detector</Meta>
        <Display className="max-w-3xl">
          The receipts behind the protocol.
        </Display>
        <Body className="mt-6 max-w-2xl text-[var(--text-secondary)] text-[1.0625rem]">
          The wellness internet runs on overstated claims. We flag the ones
          that crossed our desk while building the protocol, with the actual
          research where we have it.
        </Body>
      </section>

      <section className="max-w-4xl mx-auto px-6 md:px-10 pb-24">
        <ul className="space-y-3">
          {ARTICLES.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/research/${a.slug}`}
                className="block bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] rounded-lg p-7 md:p-8 transition-colors duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-canvas)]"
              >
                <h2 className="font-serif text-[1.375rem] md:text-[1.5rem] leading-[1.2] text-[var(--text-primary)] mb-3 group-hover:text-[var(--text-primary)]">
                  {a.headline}
                </h2>
                <p className="font-sans text-[0.9375rem] text-[var(--text-secondary)] leading-[1.55] mb-4">
                  {a.summary}
                </p>
                <span className="inline-flex items-center gap-2 font-mono text-[0.75rem] uppercase tracking-[0.02em] text-[var(--accent-base)] group-hover:gap-3 transition-all duration-150">
                  Read the breakdown
                  <ArrowRight size={12} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </PublicLayout>
  );
}
