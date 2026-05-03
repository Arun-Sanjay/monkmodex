"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus } from "lucide-react";
import { Eyebrow } from "@/components/shared/Eyebrow";
import {
  Reveal,
  RevealHeading,
  RevealStagger,
  RevealItem,
} from "@/components/shared/Reveal";
import { cn } from "@/lib/cn";

const FAQS = [
  {
    q: "Is this medical advice?",
    a: "No. Monk ModeX is an evidence-based protocol for healthy adults. If you're flagged for severe alcohol dependence, elevated PHQ-2/GAD-2, or disordered-eating history, the diagnostic surfaces resources and recommends professional support — and the protocol adjusts (or refuses, in the case of severe AUD) accordingly. It's not a replacement for a clinician.",
  },
  {
    q: "Why no subscription?",
    a: "Subscriptions don't fit the audience or the product. The protocol is 30 or 90 days. After that, you're operating from your own habits, not from us. We're not interested in retention metrics that compete with the principle.",
  },
  {
    q: "What's actually personalized?",
    a: "Your primary cut, secondary cuts, abstinence window (30/60/90 based on pattern duration), self-binding strategies for your specific stimulus, if-then plans calibrated to your work and life, daily non-negotiables anchored to routines you already have. Substrate priorities scale with how broken your sleep, sunlight, and movement are.",
  },
  {
    q: "Days 1–14 feel worse — is something broken?",
    a: "No, that's the recovery happening. Anna Lembke's pleasure-pain balance model: every spike of pleasure leaves gremlins on the pain side, and they fall off slowly when the spikes stop. The diagnostic warns you about this in advance so the discomfort doesn't read as failure.",
  },
  {
    q: "Refund policy?",
    a: "30-day money-back guarantee, no questions, no friction. The diagnosis paragraph and protocol PDF are concrete deliverables — if they didn't land for you, that's a refund.",
  },
  {
    q: "Why is the dashboard so plain?",
    a: "Deliberate. The product is anti-supernormal-stimulus by design. No streaks-with-reset, no XP, no celebration animations, no variable-reward push. The cure can't have the same patterns the protocol cures. If the dashboard feels boring next to TikTok, that's working as intended.",
  },
];

export function FAQ() {
  return (
    <section id="faqs" className="py-24 md:py-32 border-t border-[var(--border-subtle)]">
      <div className="max-w-3xl mx-auto px-6 md:px-8">
        <Reveal className="text-center mb-12 md:mb-16" amount={0.5}>
          <div className="flex justify-center mb-5">
            <Eyebrow>Honest answers</Eyebrow>
          </div>
          <RevealHeading
            className="font-serif text-[2rem] sm:text-[2.5rem] md:text-[3rem] leading-[1.15] tracking-[-0.015em] text-[var(--text-primary)]"
            lines={[<span key="line1">Things people ask.</span>]}
          />
        </Reveal>

        <RevealStagger
          stagger={0.06}
          amount={0.15}
          className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] divide-y divide-[var(--border-subtle)] overflow-hidden"
        >
          {FAQS.map((f, i) => (
            <RevealItem key={i}>
              <FAQItem {...f} />
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-6 px-7 md:px-8 py-6 text-left hover:bg-[var(--bg-elevated)]/50 transition-colors duration-150"
      >
        <span className="font-serif text-[1.125rem] md:text-[1.25rem] leading-[1.3] text-[var(--text-primary)]">
          {q}
        </span>
        <span
          className={cn(
            "shrink-0 w-8 h-8 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center transition-transform duration-200",
            open ? "rotate-45 bg-[var(--accent-muted)] border-[var(--accent-base)]" : ""
          )}
        >
          <Plus
            size={14}
            strokeWidth={1.75}
            className={cn(
              "transition-colors duration-200",
              open ? "text-[var(--accent-base)]" : "text-[var(--text-secondary)]"
            )}
          />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="px-7 md:px-8 pb-6 font-sans text-[0.9375rem] md:text-[1rem] leading-[1.6] text-[var(--text-secondary)] max-w-2xl">
              {a}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
