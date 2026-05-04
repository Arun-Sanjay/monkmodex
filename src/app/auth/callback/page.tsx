import { Suspense } from "react";
import { CallbackHandler } from "@/components/auth/CallbackHandler";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Signing you in",
  robots: { index: false, follow: false },
};

/**
 * Auth callback. Handles BOTH:
 *  - PKCE flow (?code=...)        — real users via signInWithOtp
 *  - Implicit flow (#access_token) — admin-generated links + some providers
 *
 * Once the session is established client-side, we POST to
 * /api/auth/post-callback which (a) decides whether to surface the claim
 * UI and (b) returns the URL to redirect to.
 */
export default function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <CallbackInner searchParams={searchParams} />
    </Suspense>
  );
}

async function CallbackInner({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next ?? "/dashboard";
  return <CallbackHandler next={next} />;
}
