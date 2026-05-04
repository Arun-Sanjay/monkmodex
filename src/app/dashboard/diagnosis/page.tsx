import { redirect } from "next/navigation";
import { resolveOwner } from "@/services/owner";
import {
  getActiveProtocol,
  getQuizResponseById,
} from "@/services/supabase/queries";
import {
  DashboardLayout,
  DashboardPage,
} from "@/components/layouts/DashboardLayout";
import { IdentityHeader } from "@/components/dashboard/IdentityHeader";
import { DiagnosisDocument } from "@/components/dashboard/DiagnosisDocument";

export const dynamic = "force-dynamic";
export const metadata = { title: "Diagnosis", robots: { index: false, follow: false } };


export default async function DiagnosisPage() {
  const owner = await resolveOwner();
  if (!owner) redirect("/diagnostic");

  const protocol = await getActiveProtocol(owner);
  if (!protocol) redirect("/diagnostic");

  const quizResponse = await getQuizResponseById(protocol.quiz_response_id);
  if (!quizResponse?.diagnosis_text) redirect("/diagnostic");

  const generatedAt =
    quizResponse.diagnosis_generated_at ?? new Date().toISOString();

  return (
    <DashboardLayout>
      <IdentityHeader identityStatement={protocol.identity_statement} />
      <DashboardPage>
        {quizResponse.diagnosis_data ? (
          <DiagnosisDocument
            data={quizResponse.diagnosis_data}
            generatedAt={generatedAt}
            identityStatement={protocol.identity_statement}
            responseId={quizResponse.id}
            typewriter={false}
          />
        ) : (
          <FallbackPlainText
            prose={quizResponse.diagnosis_text}
            generatedAt={generatedAt}
            identityStatement={protocol.identity_statement}
          />
        )}
      </DashboardPage>
    </DashboardLayout>
  );
}

/**
 * Fallback for legacy diagnoses that pre-date the structured `diagnosis_data`
 * column. Renders plain prose with the new mono header.
 */
function FallbackPlainText({
  prose,
  generatedAt,
  identityStatement,
}: {
  prose: string;
  generatedAt: string;
  identityStatement: string | null;
}) {
  return (
    <div>
      <div className="border-y border-[var(--border-subtle)] py-4 mb-10 md:mb-12">
        <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--text-tertiary)]">
          <span className="text-[var(--accent-base)]">
            Reward System Diagnosis
          </span>
          <span className="tabular-nums">
            {new Date(generatedAt)
              .toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
              .toUpperCase()}
          </span>
        </div>
        {identityStatement ? (
          <p className="mt-3 font-serif italic text-[1rem] md:text-[1.0625rem] leading-[1.5] text-[var(--text-secondary)]">
            &ldquo;{identityStatement.replace(/^…|^\.\.\./, "").trim()}&rdquo;
          </p>
        ) : null}
      </div>
      <article className="space-y-6 max-w-[58ch]">
        {prose.split(/\n\n+/).map((p, i) => (
          <p
            key={i}
            className="font-sans text-[1.0625rem] md:text-[1.1875rem] leading-[1.65] text-[var(--text-primary)]"
          >
            {p.trim()}
          </p>
        ))}
      </article>
    </div>
  );
}
