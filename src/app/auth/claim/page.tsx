import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Panel } from "@/components/dashboard/Panel";
import { ClaimForm } from "@/components/auth/ClaimForm";
import { getAuthUser } from "@/services/supabase/auth-server";
import {
  getActiveProtocolBySession,
  getQuizResponsesBySession,
} from "@/services/supabase/queries";

export const metadata = {
  title: "Save your protocol",
};
export const dynamic = "force-dynamic";

export default async function ClaimPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next ?? "/dashboard";

  const user = await getAuthUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(next)}`);

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("mmx_session")?.value;
  if (!sessionToken) redirect(next);

  // Detect orphaned anonymous data
  const protocol = await getActiveProtocolBySession(sessionToken);
  const responses = await getQuizResponsesBySession(sessionToken);
  const orphanedResponses = responses.filter((r) => r.user_id === null);

  // Nothing to claim → straight to next
  if (!protocol && orphanedResponses.length === 0) redirect(next);

  // Already claimed → straight to next
  if (
    protocol?.user_id === user.userId &&
    orphanedResponses.every((r) => r.user_id !== null)
  ) {
    redirect(next);
  }

  return (
    <PublicLayout showNav={false}>
      <div className="max-w-2xl mx-auto px-6 md:px-10 pt-10 md:pt-16 pb-12">
        <div className="flex items-center justify-between gap-6 mb-12 md:mb-16">
          <Link
            href="/"
            className="font-serif text-[1rem] tracking-[-0.01em] text-[var(--text-primary)] hover:text-[var(--accent-base)] transition-colors"
          >
            MMX
          </Link>
          <div className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--text-tertiary)]">
            One last step
          </div>
        </div>

        <div className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--accent-base)] mb-3">
          Save your work
        </div>
        <h1 className="font-serif text-[1.875rem] md:text-[2.375rem] leading-[1.1] tracking-[-0.018em] text-[var(--text-primary)] mb-5">
          We found a protocol on this device.
        </h1>
        <p className="font-sans text-[1rem] md:text-[1.0625rem] leading-[1.65] text-[var(--text-secondary)] max-w-prose">
          You took the diagnostic before signing in.
          {protocol
            ? ` On ${formatHumanDate(protocol.start_date)}, you unlocked the ${
                protocol.tier
              } tier.`
            : ""}{" "}
          Linking it to your account ({user.email ?? "your email"}) will save
          your check-ins, journal, and protocol so you can pick up where you
          left off on any device.
        </p>

        <Panel className="mt-9 p-6 md:p-7">
          <div className="flex items-center gap-2 font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--accent-base)] mb-4">
            <Lock size={11} strokeWidth={2} />
            What you&rsquo;re saving
          </div>
          <ul className="space-y-2 font-sans text-[0.9375rem] leading-[1.6] text-[var(--text-primary)]">
            {orphanedResponses.length > 0 ? (
              <li>
                <span className="font-mono text-[0.75rem] tabular-nums text-[var(--text-tertiary)] mr-3">
                  ×{orphanedResponses.length}
                </span>
                Diagnostic{" "}
                {orphanedResponses.length === 1 ? "response" : "responses"}{" "}
                with diagnosis
              </li>
            ) : null}
            {protocol ? (
              <li>
                <span className="font-mono text-[0.75rem] tabular-nums text-[var(--text-tertiary)] mr-3">
                  1
                </span>
                <span className="capitalize">{protocol.tier}</span> protocol —
                started {formatHumanDate(protocol.start_date)} ·{" "}
                {protocol.duration_days} days
              </li>
            ) : null}
          </ul>
        </Panel>

        <div className="mt-9">
          <ClaimForm next={next} />
        </div>

        <div className="mt-7 pt-6 border-t border-[var(--border-subtle)]">
          <Link
            href={next}
            className="inline-flex items-center gap-1.5 font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
          >
            Skip — start fresh on this account
            <ArrowRight size={11} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}

function formatHumanDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
