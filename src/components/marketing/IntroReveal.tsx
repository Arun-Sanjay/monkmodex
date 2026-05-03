"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Eyebrow } from "@/components/shared/Eyebrow";

/**
 * IntroReveal — large two-tone heading whose words brighten as you scroll
 * past it. The pattern: bright opener · dim explanation · bright closer.
 *
 * Implementation: each word gets its own opacity tied to scroll progress.
 * Bright passages start opaque; dim passages stay at lower opacity until
 * the user has scrolled into the section.
 */
export function IntroReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 30%"],
  });

  return (
    <section className="relative py-24 md:py-32">
      <div ref={ref} className="relative max-w-3xl mx-auto px-6 md:px-8">
        <div className="flex justify-center mb-8">
          <Eyebrow>The thesis</Eyebrow>
        </div>
        <h2 className="font-serif text-[1.5rem] sm:text-[1.875rem] md:text-[2.25rem] leading-[1.35] tracking-[-0.015em] text-center">
          <RevealLine
            scrollYProgress={scrollYProgress}
            from={0}
            to={0.25}
            tone="bright"
          >
            Forty years of addiction research already exists.
          </RevealLine>{" "}
          <RevealLine
            scrollYProgress={scrollYProgress}
            from={0.18}
            to={0.55}
            tone="dim"
          >
            It says nothing about superpowers, dopamine detoxes, or twenty-one
            days. It says clear, replicated things about how reward systems
            recalibrate, how habits actually form, and how cuts actually stick.
          </RevealLine>{" "}
          <RevealLine
            scrollYProgress={scrollYProgress}
            from={0.5}
            to={0.85}
            tone="bright"
          >
            We built the protocol around what&rsquo;s true.
          </RevealLine>
        </h2>
      </div>
    </section>
  );
}

function RevealLine({
  children,
  scrollYProgress,
  from,
  to,
  tone,
}: {
  children: React.ReactNode;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  from: number;
  to: number;
  tone: "bright" | "dim";
}) {
  const opacity = useTransform(
    scrollYProgress,
    [from, to],
    tone === "bright" ? [0.25, 1] : [0.18, 0.55]
  );
  return (
    <motion.span
      style={{ opacity }}
      className={tone === "bright" ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}
    >
      {children}
    </motion.span>
  );
}
