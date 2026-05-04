import { redirect } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { LogIn, LogOut } from "lucide-react";
import { resolveOwner } from "@/services/owner";
import { getAuthUser } from "@/services/supabase/auth-server";
import { getActiveProtocol } from "@/services/supabase/queries";
import {
  DashboardLayout,
  DashboardPage,
} from "@/components/layouts/DashboardLayout";
import { IdentityHeader } from "@/components/dashboard/IdentityHeader";
import { Section } from "@/components/dashboard/Section";
import { Panel } from "@/components/dashboard/Panel";
import {
  ExportButton,
  WipeButton,
} from "@/components/dashboard/AccountActions";
import { formatShortDate } from "@/lib/date";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings", robots: { index: false, follow: false } };


export default async function SettingsPage() {
  const owner = await resolveOwner();
  if (!owner) redirect("/diagnostic");

  const protocol = await getActiveProtocol(owner);
  if (!protocol) redirect("/diagnostic");

  const authUser = await getAuthUser();

  return (
    <DashboardLayout>
      <IdentityHeader identityStatement={protocol.identity_statement} />
      <DashboardPage>
        <Section
          kicker="Settings"
          title="Account."
          description={
            authUser
              ? "Signed in. Your protocol is saved to this account."
              : "Anonymous session. Sign in to save your protocol across devices."
          }
        />

        <Panel tone="default">
          <div className="divide-y divide-[var(--border-subtle)]">
            <Field
              label="Account"
              value={
                authUser ? (
                  <span className="font-serif text-[1.0625rem] tracking-[-0.005em] text-[var(--text-primary)]">
                    {authUser.email ?? "Signed in"}
                  </span>
                ) : (
                  <Link
                    href="/sign-in?next=/dashboard/settings"
                    className="inline-flex items-center gap-2 font-mono text-[0.6875rem] tracking-[0.18em] uppercase px-3 py-2 rounded-[5px] bg-[var(--accent-base)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] transition-colors"
                  >
                    <LogIn size={12} strokeWidth={2} />
                    Sign in to save
                  </Link>
                )
              }
              meta={
                authUser
                  ? "Magic-link auth. No password to remember."
                  : "Anonymous data lives in a cookie on this device."
              }
            />
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
                    {protocol.identity_statement
                      .replace(/^…|^\.\.\./, "")
                      .trim()}
                  </span>
                ) : (
                  <span className="font-sans text-[var(--text-tertiary)]">
                    (none set)
                  </span>
                )
              }
            />
            <Field
              label="Export"
              value={<ExportButton />}
              meta="Download every row this account holds — JSON, machine-readable, includes diagnosis, protocol, check-ins, lapses."
            />
            <Field
              label="Delete"
              value={<WipeButton />}
              meta="Hard delete. No recovery. Run it before you walk away if you want a clean exit."
            />
            {authUser ? (
              <Field
                label="Sign out"
                value={
                  <form action="/auth/sign-out" method="post">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 font-mono text-[0.6875rem] tracking-[0.18em] uppercase px-3 py-2 rounded-[5px] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <LogOut size={12} strokeWidth={2} />
                      Sign out
                    </button>
                  </form>
                }
                meta="You'll stay on this device, but won't be able to edit your protocol until you sign in again."
              />
            ) : null}
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
