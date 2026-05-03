import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSessionToken } from "@/services/session";
import { getActiveProtocol } from "@/services/supabase/queries";
import {
  DashboardLayout,
  DashboardPage,
} from "@/components/layouts/DashboardLayout";
import { IdentityHeader } from "@/components/dashboard/IdentityHeader";
import { Section } from "@/components/dashboard/Section";
import { Panel } from "@/components/dashboard/Panel";
import { formatShortDate } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const sessionToken = await getSessionToken();
  if (!sessionToken) redirect("/diagnostic");

  const protocol = await getActiveProtocol(sessionToken);
  if (!protocol) redirect("/diagnostic");

  return (
    <DashboardLayout>
      <IdentityHeader identityStatement={protocol.identity_statement} />
      <DashboardPage>
        <Section
          kicker="Settings"
          title="Account."
          description="Read-only for now. Auth and account management land in the shippable build."
        />

        <Panel tone="default">
          <div className="divide-y divide-[var(--border-subtle)]">
            <Field
              label="Tier"
              value={
                <span className="font-serif text-[1.125rem] tracking-[-0.005em] text-[var(--text-primary)] capitalize">
                  {protocol.tier}
                </span>
              }
              meta={`${protocol.duration_days}-day protocol`}
            />
            <Field
              label="Started"
              value={
                <span className="font-serif text-[1.125rem] tracking-[-0.005em] text-[var(--text-primary)]">
                  {formatShortDate(protocol.start_date)}
                </span>
              }
              meta={protocol.start_date}
            />
            <Field
              label="Identity statement"
              value={
                protocol.identity_statement ? (
                  <span className="font-serif italic text-[1.0625rem] leading-[1.5] text-[var(--text-primary)]">
                    {protocol.identity_statement.replace(/^…|^\.\.\./, "").trim()}
                  </span>
                ) : (
                  <span className="font-sans text-[var(--text-tertiary)]">
                    (none set)
                  </span>
                )
              }
            />
            <Field
              label="Session"
              value={
                <code className="font-mono text-[0.875rem] text-[var(--text-secondary)] tabular-nums">
                  {sessionToken.slice(0, 8)}…{sessionToken.slice(-4)}
                </code>
              }
              meta="Dev mode — your data ties to a session token in a cookie."
            />
          </div>
        </Panel>
      </DashboardPage>
    </DashboardLayout>
  );
}

function Field({
  label,
  value,
  meta,
}: {
  label: string;
  value: ReactNode;
  meta?: string;
}) {
  return (
    <div className="px-6 md:px-8 py-5 md:py-6 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-3 md:gap-6">
      <div className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--text-tertiary)] md:pt-1">
        {label}
      </div>
      <div className="space-y-1">
        <div>{value}</div>
        {meta ? (
          <div className="font-sans text-[0.8125rem] text-[var(--text-tertiary)]">
            {meta}
          </div>
        ) : null}
      </div>
    </div>
  );
}
