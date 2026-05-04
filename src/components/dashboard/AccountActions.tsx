"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Download } from "lucide-react";

export function ExportButton() {
  return (
    <a
      href="/api/account/export"
      className="inline-flex items-center gap-2 font-mono text-[0.6875rem] tracking-[0.18em] uppercase px-3 py-2 rounded-[5px] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
    >
      <Download size={12} strokeWidth={2} />
      Export JSON
    </a>
  );
}

export function WipeButton() {
  const router = useRouter();
  const [step, setStep] = useState<"idle" | "confirm" | "done">("idle");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const wipe = () => {
    if (confirm !== "WIPE") {
      setError("Type WIPE in capitals to confirm.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/account/wipe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ confirm: "WIPE" }),
        });
        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || "Wipe failed");
        }
        setStep("done");
        // Hard navigate: cookies have changed
        window.location.href = "/";
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't wipe.");
      }
    });
  };

  if (step === "done") return null;

  if (step === "idle") {
    return (
      <button
        type="button"
        onClick={() => setStep("confirm")}
        className="inline-flex items-center gap-2 font-mono text-[0.6875rem] tracking-[0.18em] uppercase px-3 py-2 rounded-[5px] border border-[var(--state-danger)]/40 hover:border-[var(--state-danger)] hover:bg-[var(--state-danger)]/10 text-[var(--state-danger)] transition-colors"
      >
        <AlertTriangle size={12} strokeWidth={2} />
        Delete account
      </button>
    );
  }

  return (
    <div className="space-y-3 max-w-md">
      <p className="font-sans text-[0.875rem] leading-[1.6] text-[var(--text-secondary)]">
        This deletes your diagnosis, protocol, check-ins, journal, and lapse
        log. There is no recovery. Type{" "}
        <code className="font-mono text-[var(--text-primary)]">WIPE</code> to
        confirm.
      </p>
      <input
        type="text"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="WIPE"
        autoFocus
        className="w-full px-3 py-2 rounded-[6px] bg-[var(--bg-canvas)] border border-[var(--border-subtle)] focus:border-[var(--state-danger)] focus:outline-none focus:ring-1 focus:ring-[var(--state-danger)] font-mono text-[0.9375rem] tracking-[0.12em] uppercase text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setStep("idle");
            setConfirm("");
            setError(null);
          }}
          disabled={isPending}
          className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={wipe}
          disabled={isPending || confirm !== "WIPE"}
          className="inline-flex items-center gap-2 font-mono text-[0.6875rem] tracking-[0.18em] uppercase px-4 py-2 rounded-[5px] bg-[var(--state-danger)] hover:bg-[var(--state-danger)]/85 text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "Wiping…" : "Confirm — delete everything"}
        </button>
      </div>
      {error ? (
        <p className="font-sans text-[0.8125rem] text-[var(--state-danger)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
