"use client";

import { motion, useInView, useMotionValue, useTransform, animate } from "motion/react";
import { useEffect, useRef } from "react";
import { Eyebrow } from "@/components/shared/Eyebrow";
import {
  Reveal,
  RevealHeading,
  RevealStagger,
  RevealItem,
} from "@/components/shared/Reveal";

const STATS = [
  {
    value: 66,
    suffix: "",
    label: "Median days to form a habit",
    note: "Lally 2010 · range 18–254",
  },
  {
    value: 30,
    suffix: "",
    label: "Minimum days for reward recalibration",
    note: "Lembke clinical norm",
  },
  {
    value: 0.65,
    suffix: "",
    label: "If-then plan effect size",
    note: "Gollwitzer 2006 · meta-analysis",
    decimal: 2,
  },
];

export function ResearchStats() {
  return (
    <section className="py-24 md:py-32 border-t border-[var(--border-subtle)]">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <Reveal className="text-center mb-16 md:mb-20" amount={0.5}>
          <div className="flex justify-center mb-5">
            <Eyebrow>The numbers</Eyebrow>
          </div>
          <RevealHeading
            className="font-serif text-[2rem] sm:text-[2.5rem] md:text-[3rem] leading-[1.15] tracking-[-0.015em] text-[var(--text-primary)] max-w-3xl mx-auto"
            lines={[<span key="line1">What the data actually says.</span>]}
          />
        </Reveal>

        <RevealStagger
          stagger={0.13}
          amount={0.25}
          className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--border-subtle)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden"
        >
          {STATS.map((s) => (
            <RevealItem key={s.label} className="h-full">
              <Stat {...s} />
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}

function Stat({
  value,
  suffix,
  label,
  note,
  decimal = 0,
}: {
  value: number;
  suffix: string;
  label: string;
  note: string;
  decimal?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const count = useMotionValue(0);
  const display = useTransform(count, (v) => v.toFixed(decimal));

  useEffect(() => {
    if (inView) {
      const controls = animate(count, value, {
        duration: 1.4,
        ease: [0.16, 1, 0.3, 1],
      });
      return () => controls.stop();
    }
  }, [inView, value, count]);

  return (
    <div
      ref={ref}
      className="h-full bg-[var(--bg-surface)] p-8 md:p-10 flex flex-col items-start gap-3"
    >
      <div className="flex items-baseline gap-1">
        <motion.span className="font-serif text-[3.5rem] md:text-[4.5rem] leading-none text-[var(--text-primary)] tabular-nums">
          {display}
        </motion.span>
        {suffix ? (
          <span className="font-serif text-[2rem] text-[var(--text-secondary)]">
            {suffix}
          </span>
        ) : null}
      </div>
      <p className="font-sans text-[1rem] text-[var(--text-primary)] leading-[1.4]">
        {label}
      </p>
      <p className="font-mono text-[0.75rem] tracking-[0.05em] uppercase text-[var(--text-tertiary)]">
        {note}
      </p>
    </div>
  );
}
