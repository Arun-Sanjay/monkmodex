import { redirect } from "next/navigation";
import { Suspense } from "react";
import { resolveOwner } from "@/services/owner";
import {
  getActiveProtocol,
  getCheckinsForProtocol,
} from "@/services/supabase/queries";
import {
  DashboardLayout,
  DashboardPage,
} from "@/components/layouts/DashboardLayout";
import { IdentityHeader } from "@/components/dashboard/IdentityHeader";
import { Section } from "@/components/dashboard/Section";
import { JournalEditor } from "@/components/dashboard/JournalEditor";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const owner = await resolveOwner();
  if (!owner) redirect("/diagnostic");

  const protocol = await getActiveProtocol(owner);
  if (!protocol) redirect("/diagnostic");

  const checkins = await getCheckinsForProtocol(protocol.id);

  return (
    <DashboardLayout>
      <IdentityHeader identityStatement={protocol.identity_statement} />
      <DashboardPage>
        <Section
          kicker="Journal"
          title="A record of the operator at work."
          description="Write or edit any day's reflection. Pick a date from the sidebar, or use the arrows. Auto-saves on blur."
        />

        <Suspense fallback={null}>
          <JournalEditor
            protocolId={protocol.id}
            startDate={protocol.start_date}
            durationDays={protocol.duration_days}
            initialCheckins={checkins}
          />
        </Suspense>
      </DashboardPage>
    </DashboardLayout>
  );
}
