import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getSessionToken } from "@/services/session";
import { getActiveProtocol } from "@/services/supabase/queries";
import {
  DashboardLayout,
  DashboardPage,
} from "@/components/layouts/DashboardLayout";
import { IdentityHeader } from "@/components/dashboard/IdentityHeader";
import { Section } from "@/components/dashboard/Section";
import { Panel } from "@/components/dashboard/Panel";
import { CutsGrid } from "@/components/dashboard/CutsGrid";
import { parseProtocolData } from "@/lib/protocol/extract";
import { dayNumber, todayDateString } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function CutsPage() {
  const sessionToken = await getSessionToken();
  if (!sessionToken) redirect("/diagnostic");

  const protocol = await getActiveProtocol(sessionToken);
  if (!protocol) redirect("/diagnostic");

  const parsed = parseProtocolData(protocol.protocol_data);
  if (!parsed) redirect("/dashboard");

  const today = todayDateString();
  const dayInto = dayNumber(protocol.start_date, today);

  return (
    <DashboardLayout>
      <IdentityHeader identityStatement={protocol.identity_statement} />
      <DashboardPage>
        <Section
          kicker="Cuts"
          title="What you&rsquo;re separating from."
          description="Lembke's principle: one drug of choice at a time outperforms all-out asceticism. Tap a cut to open its full plan — rationale, self-binding, and if-then triggers, written before the urge fires."
        />

        {parsed.cuts.length === 0 ? (
          <Panel className="p-8 text-center">
            <p className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--text-tertiary)] mb-2">
              No cuts yet
            </p>
            <p className="font-serif text-[1.125rem] text-[var(--text-primary)]">
              Substrate first.
            </p>
          </Panel>
        ) : (
          <Suspense fallback={null}>
            <CutsGrid cuts={parsed.cuts} dayInProtocol={dayInto} />
          </Suspense>
        )}
      </DashboardPage>
    </DashboardLayout>
  );
}
