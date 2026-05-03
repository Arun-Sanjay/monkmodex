"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, ExternalLink } from "lucide-react";
import { H1, Body, BodySm, Meta } from "@/components/shared/Type";
import type { SafetyGate } from "@/lib/quiz/safety-gates";

export function SafetyGateScreen({
  gate,
  onContinue,
}: {
  gate: SafetyGate;
  onContinue?: () => void;
}) {
  return (
    <div className="space-y-8 md:space-y-10 max-w-2xl">
      <div className="flex items-center gap-3">
        <AlertTriangle
          size={20}
          strokeWidth={1.5}
          className="text-[var(--accent-base)]"
        />
        <Meta>
          {gate.hardBlock ? "We have to stop here" : "Before we continue"}
        </Meta>
      </div>

      <H1 className="max-w-2xl">{gate.title}</H1>

      <Body className="max-w-2xl text-[var(--text-secondary)] text-[1.0625rem]">
        {gate.body}
      </Body>

      {gate.resources?.length ? (
        <div className="space-y-3 pt-2">
          <Meta>Resources</Meta>
          <ul className="space-y-2">
            {gate.resources.map((r) => (
              <li key={r.href}>
                <a
                  href={r.href}
                  target={r.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    r.href.startsWith("http") ? "noopener noreferrer" : undefined
                  }
                  className="inline-flex items-center gap-2 text-[var(--text-primary)] underline decoration-[var(--border-default)] hover:decoration-[var(--accent-base)] underline-offset-4"
                >
                  {r.label}
                  {r.href.startsWith("http") ? (
                    <ExternalLink size={14} strokeWidth={1.5} />
                  ) : null}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="pt-4 flex flex-col sm:flex-row gap-4">
        {gate.hardBlock ? (
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-[6px] bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors duration-150"
          >
            Return to home
          </Link>
        ) : (
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-[6px] bg-[var(--accent-base)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] font-medium transition-colors duration-150"
          >
            I understand — continue
            <ArrowRight size={16} />
          </button>
        )}
        {!gate.hardBlock ? (
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-[6px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150"
          >
            Step away
          </Link>
        ) : null}
      </div>

      {gate.hardBlock ? (
        <BodySm className="text-[var(--text-tertiary)] pt-2">
          We don&rsquo;t collect or store your responses unless you complete the
          diagnostic.
        </BodySm>
      ) : null}
    </div>
  );
}
