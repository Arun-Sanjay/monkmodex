import { redirect } from "next/navigation";
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
import { CalendarView } from "@/components/dashboard/CalendarView";
import { parseProtocolData } from "@/lib/protocol/extract";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const sessionToken = await getSessionToken();
  if (!sessionToken) redirect("/diagnostic");

  const protocol = await getActiveProtocol(sessionToken);
  if (!protocol) redirect("/diagnostic");

  const parsed = parseProtocolData(protocol.protocol_data);
  if (!parsed) redirect("/dashboard");

  const checkins = await getCheckinsForProtocol(protocol.id);

  return (
    <DashboardLayout>
      <IdentityHeader identityStatement={protocol.identity_statement} />
      <DashboardPage>
        <Section
          kicker={`${protocol.duration_days}-day protocol`}
          title="Calendar."
          description="Tap a day to see what you did, how you logged, and what you focused on. Past days fill by % completion — no streaks that reset."
        />

        <CalendarView
          startDate={protocol.start_date}
          durationDays={protocol.duration_days}
          nonNegotiables={parsed.non_negotiables}
          checkins={checkins}
        />
      </DashboardPage>
    </DashboardLayout>
  );
}
