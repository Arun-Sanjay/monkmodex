import { redirect, notFound } from "next/navigation";
import { resolveOwner } from "@/services/owner";
import {
  getActiveProtocol,
  getQuizResponseById,
} from "@/services/supabase/queries";
import { ProtocolPrintDocument } from "@/components/dashboard/ProtocolPrintDocument";
import { parseProtocolData } from "@/lib/protocol/extract";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Protocol — print",
  robots: { index: false, follow: false },
};

export default async function ProtocolPrintPage({
  searchParams,
}: {
  searchParams: Promise<{ noprint?: string }>;
}) {
  const sp = await searchParams;
  const autoPrint = sp.noprint !== "1";

  const owner = await resolveOwner();
  if (!owner) redirect("/diagnostic");

  const protocol = await getActiveProtocol(owner);
  if (!protocol) redirect("/diagnostic");

  const parsed = parseProtocolData(protocol.protocol_data);
  if (!parsed) notFound();

  const quizResponse = await getQuizResponseById(protocol.quiz_response_id);
  const diagnosisData = quizResponse?.diagnosis_data ?? null;
  const diagnosisProse = quizResponse?.diagnosis_text ?? "";

  return (
    <ProtocolPrintDocument
      tier={protocol.tier}
      durationDays={protocol.duration_days}
      startDate={protocol.start_date}
      identityStatement={protocol.identity_statement}
      protocol={parsed}
      diagnosisData={diagnosisData}
      diagnosisProse={diagnosisProse}
      generatedAt={protocol.generated_at}
      autoPrint={autoPrint}
    />
  );
}
