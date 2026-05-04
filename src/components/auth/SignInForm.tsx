"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { getBrowserClient } from "@/services/supabase/auth-browser";

export function SignInForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        const supabase = getBrowserClient();
        const origin =
          typeof window !== "undefined"
            ? window.location.origin
            : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
        const { error: err } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (err) throw err;
        router.push(`/sign-in?sent=1&next=${encodeURIComponent(next)}`);
        router.refresh();
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "Couldn't send the link. Try again in a moment."
        );
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="sr-only">Email</span>
        <div className="relative">
          <Mail
            size={14}
            strokeWidth={1.5}
            aria-hidden
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
          />
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={isPending}
            className="w-full pl-11 pr-4 h-12 rounded-[6px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] focus:border-[var(--accent-base)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-base)] focus:ring-offset-2 focus:ring-offset-[var(--bg-canvas)] font-sans text-[0.9375rem] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-colors disabled:opacity-60"
          />
        </div>
      </label>

      <button
        type="submit"
        disabled={isPending || !email.trim()}
        className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-[6px] bg-[var(--accent-base)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-canvas)]"
      >
        {isPending ? "Sending…" : "Send magic link"}
      </button>

      {error ? (
        <p className="font-sans text-[0.875rem] text-[var(--state-danger)]">
          {error}
        </p>
      ) : null}
    </form>
  );
}
