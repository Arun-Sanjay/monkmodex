import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Lock } from "lucide-react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { H1, H2, Body, BodySm, Meta } from "@/components/shared/Type";
import { UnlockButton } from "@/components/results/UnlockButton";
import { DiagnosisDocument } from "@/components/dashboard/DiagnosisDocument";
import { getSessionToken } from "@/services/session";
import { getQuizResponseById } from "@/services/supabase/queries";
import { getCutLabel } from "@/lib/quiz/schema";

interface PageProps {
  params: Promise<{ responseId: string }>;
}

export default async function DiagnosisResultsPage({ params }: PageProps) {
  const { responseId } = await params;
  const sessionToken = await getSessionToken();

  if (!sessionToken) {
    redirect("/diagnostic");
  }

  const row = await getQuizResponseById(responseId);
  if (!row) notFound();
  if (row.session_token !== sessionToken) {
    // Different session — refuse rather than disclose
    redirect("/diagnostic");
  }

  // If already unlocked, jump straight into the dashboard
  if (row.tier && row.unlocked_at) {
    redirect("/dashboard");
  }

  if (!row.diagnosis_text) {
    return (
      <PublicLayout showNav={false}>
        <div className="max-w-3xl mx-auto px-6 md:px-10 py-16 md:py-24">
          <Meta>Still generating…</Meta>
          <H1 className="mt-4 max-w-2xl">Your diagnosis isn&rsquo;t ready yet.</H1>
          <Body className="mt-6 text-[var(--text-secondary)]">
            This usually takes 10–20 seconds. Refresh in a moment.
          </Body>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout showNav={false}>
      <div className="max-w-3xl mx-auto px-6 md:px-10 pt-8 md:pt-10">
        <div className="flex items-center justify-between gap-6 mb-12 md:mb-16">
          <Link
            href="/"
            className="font-serif text-[1rem] tracking-[-0.01em] text-[var(--text-primary)] hover:text-[var(--accent-base)] transition-colors"
          >
            MMX
          </Link>
          <div className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--text-tertiary)]">
            Step <span className="text-[var(--text-secondary)] tabular-nums">2</span>
            <span className="mx-1.5 text-[var(--border-default)]">/</span>
            <span className="tabular-nums">3</span>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 md:px-10 pb-12 md:pb-20">
        {/* Diagnosis — structured if available, fallback to plain prose */}
        {row.diagnosis_data ? (
          <DiagnosisDocument
            data={row.diagnosis_data}
            generatedAt={
              row.diagnosis_generated_at ?? new Date().toISOString()
            }
            identityStatement={row.identity_statement}
            responseId={responseId}
            typewriter={true}
            showDownload={true}
          />
        ) : (
          <>
            <Meta className="mb-3">Your reward system diagnosis</Meta>
            <H1 className="max-w-2xl mb-10 md:mb-12">
              Read this carefully.
            </H1>
            <article className="prose-mmx max-w-2xl">
              {row.diagnosis_text.split(/\n\n+/).map((paragraph, i) => (
                <p
                  key={i}
                  className="font-sans text-[1.0625rem] md:text-[1.125rem] leading-[1.7] text-[var(--text-primary)] mb-5"
                >
                  {paragraph.trim()}
                </p>
              ))}
            </article>
          </>
        )}

        {/* Oxblood divider */}
        <div className="mt-16 md:mt-24 flex items-center gap-4 max-w-3xl">
          <div className="h-px flex-1 bg-[var(--border-subtle)]" />
          <span className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--accent-base)]">
            Your protocol targets sleep first
          </span>
          <div className="h-px flex-1 bg-[var(--border-subtle)]" />
        </div>

        {/* Preview */}
        <section className="mt-12 md:mt-16">
          <Meta className="mb-3">Foundation Protocol preview</Meta>
          <H2 className="max-w-2xl mb-8">What you&rsquo;ll unlock.</H2>
          <PreviewBlock
            primaryCutLabel={
              row.primary_cut ? getCutLabel(row.primary_cut) : null
            }
            secondaryCuts={row.secondary_cuts.map(getCutLabel)}
          />
        </section>

        {/* Unlock CTAs */}
        <section className="mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-6">
          <UnlockButton
            responseId={responseId}
            tier="foundation"
            title="Foundation"
            duration="30 days"
            items={[
              "Personalized diagnosis (above)",
              "Custom cuts + self-binding strategies",
              "2–4 daily non-negotiables anchored to your routines",
              "If-then plans for high-risk moments",
              "Daily check-in dashboard",
            ]}
          />
          <UnlockButton
            responseId={responseId}
            tier="operator"
            title="Operator"
            duration="90 days"
            items={[
              "Everything in Foundation",
              "Body Reset (weeks 3–6) — exercise, cold, optional TRE",
              "Mind Reset (weeks 5–8) — meditation, journaling, deep work",
            ]}
            highlight
          />
        </section>

        <BodySm className="mt-12 max-w-2xl text-[var(--text-tertiary)]">
          (Dev mode — no payment required. In the shippable version this is a
          $19 / $39 one-time purchase via Lemon Squeezy.)
        </BodySm>
      </div>
    </PublicLayout>
  );
}

function PreviewBlock({
  primaryCutLabel,
  secondaryCuts,
}: {
  primaryCutLabel: string | null;
  secondaryCuts: string[];
}) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-7 md:p-9 space-y-7">
      <div>
        <Meta className="mb-2">Your primary cut</Meta>
        <div className="font-serif text-[1.5rem] text-[var(--text-primary)]">
          {primaryCutLabel ?? "—"}
        </div>
        {secondaryCuts.length ? (
          <BodySm className="mt-2">
            Secondary: {secondaryCuts.join(", ")}
          </BodySm>
        ) : null}
      </div>

      <div className="space-y-4">
        <Meta>Your daily non-negotiables</Meta>
        <BlurredList count={4} />
      </div>

      <div className="space-y-4">
        <Meta>Your if-then plans</Meta>
        <BlurredList count={3} />
      </div>

      <div className="space-y-4">
        <Meta>Your 30-day calendar</Meta>
        <div className="grid grid-cols-10 gap-1.5 select-none pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-[3px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] blur-[2px] opacity-60"
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
        <Lock
          size={14}
          strokeWidth={1.5}
          className="text-[var(--accent-base)]"
        />
        <BodySm className="text-[var(--text-tertiary)]">
          Unlock to see the full protocol below.
        </BodySm>
      </div>
    </div>
  );
}

function BlurredList({ count }: { count: number }) {
  return (
    <div className="space-y-2.5 select-none pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-5 rounded-[3px] bg-[var(--bg-elevated)] blur-[3px] opacity-60"
          style={{ width: `${60 + Math.floor(Math.sin(i * 1.3) * 25 + 25)}%` }}
        />
      ))}
    </div>
  );
}
