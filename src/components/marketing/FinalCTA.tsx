"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal, RevealHeading } from "@/components/shared/Reveal";

export function FinalCTA() {
  return (
    <section className="pt-16 md:pt-24 pb-28 md:pb-36">
      <Reveal className="max-w-5xl mx-auto px-6 md:px-8" amount={0.3} blur>
        <div className="relative rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden">
          {/* Subtle inner glow */}
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(ellipse 60% 60% at 50% 100%, rgba(122,31,36,0.22), transparent 70%)",
            }}
          />
          <div className="relative px-8 md:px-16 py-20 md:py-28 text-center">
            <RevealHeading
              className="font-serif text-[2rem] sm:text-[2.75rem] md:text-[3.5rem] leading-[1.1] tracking-[-0.02em] text-[var(--text-primary)] max-w-3xl mx-auto"
              stagger={0.14}
              lines={[
                <span key="line1">Start the diagnostic.</span>,
                <span key="line2" className="italic text-[var(--text-secondary)]">
                  Ninety seconds.
                </span>,
              ]}
            />
            <Reveal delay={0.35} amount={0.4} duration={0.7}>
              <p className="mt-6 max-w-xl mx-auto font-sans text-[1rem] md:text-[1.0625rem] text-[var(--text-secondary)] leading-[1.55]">
                No signup, no email capture. Your diagnosis is generated and saved to
                your session. Read it. Decide if you want the protocol.
              </p>
              <div className="mt-10">
                <Link
                  href="/diagnostic"
                  className="group inline-flex items-center gap-2 h-13 px-8 py-3.5 rounded-full bg-[var(--accent-base)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] font-medium transition-all duration-200 shadow-[0_0_48px_-8px_var(--accent-base)]"
                >
                  Start the diagnostic
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
              <p className="mt-6 font-mono text-[0.75rem] tracking-[0.08em] uppercase text-[var(--text-tertiary)]">
                30-day refund · No subscription
              </p>
            </Reveal>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
