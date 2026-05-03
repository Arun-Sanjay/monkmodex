import { notFound, redirect } from "next/navigation";
import { getSessionToken } from "@/services/session";
import { getQuizResponseById } from "@/services/supabase/queries";
import { DiagnosisPrintDocument } from "@/components/dashboard/DiagnosisPrintDocument";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ responseId: string }>;
  searchParams: Promise<{ noprint?: string }>;
}

/**
 * Print-only diagnosis route. Layout is tuned for paper (A4-ish), no nav,
 * no chrome, no JS. The client-side PrintTrigger nudges window.print()
 * after the fonts settle. The user saves as PDF via the browser dialog.
 *
 * `?noprint=1` disables the auto-print dialog so the layout can be
 * previewed (and screenshot'd by automation).
 */
export default async function DiagnosisPrintPage({ params, searchParams }: PageProps) {
  const { responseId } = await params;
  const sp = await searchParams;
  const autoPrint = sp.noprint !== "1";
  const sessionToken = await getSessionToken();
  if (!sessionToken) redirect("/diagnostic");

  const row = await getQuizResponseById(responseId);
  if (!row) notFound();
  if (row.session_token !== sessionToken) redirect("/diagnostic");
  if (!row.diagnosis_data && !row.diagnosis_text) notFound();

  return (
    <DiagnosisPrintDocument
      data={row.diagnosis_data}
      fallbackProse={row.diagnosis_text ?? ""}
      generatedAt={row.diagnosis_generated_at ?? new Date().toISOString()}
      identityStatement={row.identity_statement}
      autoPrint={autoPrint}
    />
  );
}
