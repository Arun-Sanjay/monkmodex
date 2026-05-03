"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

const EASE_OUT_QUINT = [0.16, 1, 0.3, 1] as const;

/**
 * Hero — pill-style nav handles the chrome above. This component renders
 * the centered display heading with floating research-citation cards on
 * the sides, replacing the testimonial cards from typical landing patterns.
 */
export function Hero() {
  return (
    <section className="relative pt-36 md:pt-44 pb-20 md:pb-28 overflow-hidden">
      <div className="relative max-w-[1400px] mx-auto px-6 md:px-8">
        <div className="relative min-h-[680px]">
          {/* Floating research cards — desktop only, positioned in the corners outside the central column */}
          <FloatingCard
            className="hidden xl:block absolute left-0 top-0"
            name="Lally et al."
            quote="Median 66 days. Range 18 to 254."
            note="2010"
            drift={{ x: 8, y: -10 }}
          />
          <FloatingCard
            className="hidden xl:block absolute left-16 bottom-0"
            name="Volkow"
            quote="D2 receptor downregulation in PET imaging."
            note="1999–2014"
            drift={{ x: -6, y: 8 }}
          />
          <FloatingCard
            className="hidden xl:block absolute right-0 top-8"
            name="Gollwitzer"
            quote="If-then plans, d = 0.65 — the strongest behavior-change tool."
            note="2006"
            drift={{ x: -10, y: 6 }}
          />
          <FloatingCard
            className="hidden xl:block absolute right-16 bottom-0"
            name="Lembke"
            quote="30 days minimum for substantial recalibration."
            note="2021"
            drift={{ x: 6, y: -8 }}
          />

          {/* Centered hero content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
            }}
            className="relative z-20 max-w-3xl mx-auto text-center pt-16 xl:pt-32"
          >
            <h1 className="font-serif text-[2.5rem] sm:text-[3.25rem] md:text-[4rem] lg:text-[4.5rem] leading-[1.05] tracking-[-0.025em] text-[var(--text-primary)]">
              <motion.span
                variants={HERO_LINE_VARIANTS}
                className="block"
              >
                The evidence-based
              </motion.span>
              <motion.span
                variants={HERO_LINE_VARIANTS}
                className="block"
              >
                version of monk mode.
              </motion.span>
            </h1>

            <motion.p
              variants={HERO_LINE_VARIANTS}
              className="mt-7 max-w-xl mx-auto font-sans text-[1.0625rem] md:text-[1.1875rem] leading-[1.55] text-[var(--text-secondary)]"
            >
              Built on 40 years of addiction-medicine research. Personalized to
              you in 90 seconds. No subscription, no streaks, no shame.
            </motion.p>

            <motion.div
              variants={HERO_LINE_VARIANTS}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/diagnostic"
                className="group relative inline-flex items-center gap-2 h-13 px-8 py-3.5 rounded-full bg-[var(--accent-base)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] font-medium transition-all duration-200 shadow-[0_0_40px_-8px_var(--accent-base)]"
              >
                Start the diagnostic
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </Link>
              <Link
                href="/research"
                className="inline-flex items-center gap-2 h-13 px-6 py-3.5 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150 font-sans text-[0.9375rem]"
              >
                Read the research
              </Link>
            </motion.div>

            <motion.p
              variants={HERO_LINE_VARIANTS}
              className="mt-7 font-mono text-[0.75rem] tracking-[0.08em] uppercase text-[var(--text-tertiary)]"
            >
              90 sec · No signup required · 30-day refund
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const HERO_LINE_VARIANTS = {
  hidden: { opacity: 0, y: 22, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE_OUT_QUINT },
  },
} as const;

function FloatingCard({
  className,
  name,
  quote,
  note,
  drift,
}: {
  className?: string;
  name: string;
  quote: string;
  note: string;
  drift: { x: number; y: number };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 1.1, delay: 0.7, ease: EASE_OUT_QUINT }}
      className={cn("w-[230px] z-10 select-none", className)}
    >
      <motion.div
        animate={{ y: [0, drift.y, 0], x: [0, drift.x, 0] }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="rounded-xl bg-[var(--bg-surface)]/85 backdrop-blur-sm border border-[var(--border-subtle)] p-4 shadow-lg"
      >
        <p className="font-mono text-[0.6875rem] tracking-[0.08em] uppercase text-[var(--accent-base)] mb-2">
          {name} · {note}
        </p>
        <p className="font-serif italic text-[0.875rem] leading-[1.4] text-[var(--text-primary)]">
          &ldquo;{quote}&rdquo;
        </p>
      </motion.div>
      <p className="mt-3 ml-1 font-mono text-[0.6875rem] tracking-[0.08em] text-[var(--text-tertiary)] uppercase">
        cited in your protocol
      </p>
    </motion.div>
  );
}
