import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getSessionToken } from "@/services/session";
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
  const sessionToken = await getSessionToken();
  if (!sessionToken) redirect("/diagnostic");

  const protocol = await getActiveProtocol(sessionToken);
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
