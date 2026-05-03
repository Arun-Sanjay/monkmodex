import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { H1, Body, Meta } from "@/components/shared/Type";
import { ARTICLES, getArticle } from "@/content/research";

export async function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: `${article.headline} — Monk ModeX`,
    description: article.summary,
  };
}

export default async function ResearchSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return (
    <PublicLayout>
      <article className="max-w-2xl mx-auto px-6 md:px-10 pt-12 md:pt-20 pb-16">
        <Link
          href="/research"
          className="inline-flex items-center gap-2 font-mono text-[0.75rem] uppercase tracking-[0.02em] text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-10 transition-colors duration-150"
        >
          <ArrowLeft size={12} />
          Back to all
        </Link>

        <Meta className="mb-3">Bullshit Detector · Updated {article.updated}</Meta>
        <H1 className="text-[1.875rem] md:text-[2.25rem] leading-[1.2]">
          {article.headline}
        </H1>
        <Body className="mt-6 mb-12 text-[var(--text-secondary)] text-[1.125rem]">
          {article.summary}
        </Body>

        <div className="prose-mmx space-y-5 [&_p]:font-sans [&_p]:text-[1.0625rem] [&_p]:md:text-[1.125rem] [&_p]:leading-[1.7] [&_p]:text-[var(--text-primary)] [&_strong]:text-[var(--text-primary)] [&_em]:italic [&_ul]:my-3">
          {article.body}
        </div>

        <section className="mt-14 pt-10 border-t border-[var(--border-subtle)]">
          <Meta className="mb-4">Sources</Meta>
          <ul className="space-y-2.5">
            {article.sources.map((s, i) => (
              <li
                key={i}
                className="font-sans text-[0.9375rem] text-[var(--text-secondary)] leading-[1.55]"
              >
                {s}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14 pt-10 border-t border-[var(--border-subtle)]">
          <p className="font-sans text-[1.0625rem] text-[var(--text-primary)] mb-4">
            Want the protocol?
          </p>
          <Link
            href="/diagnostic"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-[6px] bg-[var(--accent-base)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] font-medium transition-colors duration-150"
          >
            Start the 90-second diagnostic
            <ArrowRight size={16} />
          </Link>
        </section>
      </article>
    </PublicLayout>
  );
}
