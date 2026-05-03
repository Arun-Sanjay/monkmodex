"use client";

import { ClipboardList, FileText, LayoutDashboard } from "lucide-react";
import { Eyebrow } from "@/components/shared/Eyebrow";
import {
  Reveal,
  RevealHeading,
  RevealStagger,
  RevealItem,
} from "@/components/shared/Reveal";

const STEPS = [
  {
    icon: ClipboardList,
    n: "01",
    title: "Take the diagnostic.",
    body: "Twenty questions across five sections — about 90 seconds. Substrate, stimuli, screening, identity.",
  },
  {
    icon: FileText,
    n: "02",
    title: "See your diagnosis.",
    body: "An honest read of what's specifically dysregulated, written by an analysis engine grounded in the research.",
  },
  {
    icon: LayoutDashboard,
    n: "03",
    title: "Live in the dashboard.",
    body: "Daily check-ins, calendar, cuts, foundation. The surface you operate from for 30 to 90 days.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 border-t border-[var(--border-subtle)]">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <Reveal className="text-center mb-16 md:mb-20" amount={0.5}>
          <div className="flex justify-center mb-5">
            <Eyebrow>How it works</Eyebrow>
          </div>
          <RevealHeading
            className="font-serif text-[2rem] sm:text-[2.5rem] md:text-[3rem] leading-[1.15] tracking-[-0.015em] text-[var(--text-primary)] max-w-3xl mx-auto"
            stagger={0.13}
            lines={[
              <span key="line1">Three steps.</span>,
              <span key="line2">Roughly two minutes to start.</span>,
            ]}
          />
        </Reveal>

        <RevealStagger
          stagger={0.13}
          amount={0.2}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {STEPS.map(({ icon: Icon, n, title, body }) => (
            <RevealItem key={n}>
              <div className="h-full rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-7 md:p-8">
                <div className="flex items-center justify-between mb-7">
                  <div className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center">
                    <Icon
                      size={16}
                      strokeWidth={1.5}
                      className="text-[var(--accent-base)]"
                    />
                  </div>
                  <span className="font-mono text-[0.75rem] tracking-[0.1em] text-[var(--text-tertiary)]">
                    {n}
                  </span>
                </div>
                <h3 className="font-serif text-[1.25rem] md:text-[1.375rem] leading-[1.25] text-[var(--text-primary)] mb-3">
                  {title}
                </h3>
                <p className="font-sans text-[0.9375rem] leading-[1.55] text-[var(--text-secondary)]">
                  {body}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
