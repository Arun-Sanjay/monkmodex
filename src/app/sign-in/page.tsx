import Link from "next/link";
import { redirect } from "next/navigation";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { SignInForm } from "@/components/auth/SignInForm";
import { getAuthUser } from "@/services/supabase/auth-server";

export const metadata = {
  title: "Sign in — Monk ModeX",
  description:
    "Sign in to save your protocol and pick up where you left off on any device.",
};

export const dynamic = "force-dynamic";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; sent?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next ?? "/dashboard";
  const sent = sp.sent === "1";

  // Already authed → straight through
  const user = await getAuthUser();
  if (user) redirect(next);

  return (
    <PublicLayout showNav={false}>
      <div className="max-w-md mx-auto px-6 md:px-10 pt-10 md:pt-16">
        <div className="flex items-center justify-between gap-6 mb-12 md:mb-16">
          <Link
            href="/"
            className="font-serif text-[1rem] tracking-[-0.01em] text-[var(--text-primary)] hover:text-[var(--accent-base)] transition-colors"
          >
            MMX
          </Link>
          <Link
            href="/diagnostic"
            className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--text-tertiary)] hover:text-[var(--accent-base)] transition-colors"
          >
            Take the diagnostic →
          </Link>
        </div>

        <div className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--accent-base)] mb-3">
          Sign in
        </div>
        <h1 className="font-serif text-[2rem] md:text-[2.25rem] leading-[1.1] tracking-[-0.018em] text-[var(--text-primary)] mb-4">
          {sent ? "Check your email." : "Welcome back."}
        </h1>
        <p className="font-sans text-[0.9375rem] md:text-[1rem] leading-[1.6] text-[var(--text-secondary)] mb-9 max-w-prose">
          {sent
            ? "We sent you a magic link. Click it on this device to finish signing in. The link expires in 60 minutes."
            : "Enter your email — we'll send you a magic link. No password to remember."}
        </p>

        {!sent ? <SignInForm next={next} /> : null}

        <div className="mt-12 pt-7 border-t border-[var(--border-subtle)]">
          <p className="font-sans text-[0.875rem] leading-[1.55] text-[var(--text-tertiary)]">
            New here? Take the{" "}
            <Link
              href="/diagnostic"
              className="text-[var(--accent-base)] hover:text-[var(--accent-hover)] transition-colors"
            >
              diagnostic
            </Link>{" "}
            first — you can sign in afterwards to save your protocol.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
