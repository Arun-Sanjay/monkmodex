"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/services/supabase/auth-browser";

/**
 * Client-side handler that completes BOTH PKCE and implicit auth flows.
 * Runs once on mount, sets the session, asks the server where to go next,
 * then replaces the URL.
 */
export function CallbackHandler({ next }: { next: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      const supabase = getBrowserClient();
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const hashParams = url.hash
        ? new URLSearchParams(url.hash.replace(/^#/, ""))
        : null;

      try {
        if (code) {
          const { error: err } = await supabase.auth.exchangeCodeForSession(code);
          if (err) throw err;
        } else if (hashParams?.get("access_token")) {
          const access_token = hashParams.get("access_token") ?? "";
          const refresh_token = hashParams.get("refresh_token") ?? "";
          const { error: err } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (err) throw err;
          // Strip the hash so it isn't visible after redirect
          history.replaceState(null, "", url.pathname + url.search);
        } else {
          throw new Error("No code or access_token in callback URL");
        }
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "Couldn't complete sign-in. Try again."
        );
        return;
      }

      // Ask the server where to go next (handles claim flow detection)
      try {
        const res = await fetch(
          `/api/auth/post-callback?next=${encodeURIComponent(next)}`,
          { method: "POST" }
        );
        const data: { next: string } = await res.json();
        router.replace(data.next || next);
      } catch {
        router.replace(next);
      }
    })();
  }, [next, router]);

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--accent-base)] mb-3">
          Signing you in
        </div>
        <p className="font-serif text-[1.5rem] leading-[1.2] tracking-[-0.012em] text-[var(--text-primary)] mb-2">
          Just a moment.
        </p>
        {error ? (
          <p className="mt-6 font-sans text-[0.875rem] text-[var(--state-danger)]">
            {error}
          </p>
        ) : (
          <p className="font-sans text-[0.875rem] text-[var(--text-tertiary)]">
            Verifying the link.
          </p>
        )}
      </div>
    </main>
  );
}
