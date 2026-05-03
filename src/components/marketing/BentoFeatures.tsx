"use client";

import { motion } from "motion/react";
import { Eyebrow } from "@/components/shared/Eyebrow";
import { Reveal, RevealHeading, RevealStagger, RevealItem } from "@/components/shared/Reveal";
import { cn } from "@/lib/cn";

export function BentoFeatures() {
  return (
    <section id="features" className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <Reveal className="text-center mb-16 md:mb-20" amount={0.5}>
          <div className="flex justify-center mb-5">
            <Eyebrow>What you get</Eyebrow>
          </div>
          <RevealHeading
            className="font-serif text-[2rem] sm:text-[2.5rem] md:text-[3rem] leading-[1.15] tracking-[-0.015em] text-[var(--text-primary)] max-w-3xl mx-auto"
            stagger={0.14}
            lines={[
              <span key="line1">
                Personalized to <span className="italic pr-1">your</span> reward
                system,
              </span>,
              <span key="line2">not someone else&rsquo;s.</span>,
            ]}
          />
        </Reveal>

        <RevealStagger
          stagger={0.11}
          amount={0.2}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          <RevealItem>
            <FeatureCard
              title="Reward System Diagnosis"
              body="A 220–280 word read of what's specifically dysregulated for you, with the mechanism cited. Not a generic '5 traits' archetype."
              accent={<DiagnosisVisual />}
            />
          </RevealItem>
          <RevealItem>
            <FeatureCard
              title="Daily non-negotiables"
              body="Two to four habits, each anchored to a routine you already have. Fogg's pattern, not a checklist of 12 things you'll abandon by Wednesday."
              accent={<NonNegotiablesVisual />}
            />
          </RevealItem>
          <RevealItem>
            <FeatureCard
              title="If-then plans"
              body="The single highest-effect tool in behavior-change psychology — pre-decided responses for your specific high-risk moments. Gollwitzer 2006, d = 0.65."
              accent={<IfThenVisual />}
            />
          </RevealItem>
        </RevealStagger>

        <RevealStagger
          stagger={0.13}
          amount={0.2}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5"
        >
          <RevealItem>
            <FeatureCard
              wide
              title="Calendar that doesn't punish you."
              body="Past days fill by % completion. Missed days don't reset a streak — because Lally found streaks aren't how habits actually form. Inconsistency derails formation; isolated misses don't."
              accent={<CalendarVisual />}
            />
          </RevealItem>
          <RevealItem>
            <FeatureCard
              wide
              title="The Bullshit Detector."
              body="Public, evidence-based rebuttals to the claims your dopamine-fried friend keeps sending you. Cold showers don't multiply dopamine 250%. Twenty-one days isn't a real number. NoFap superpowers don't exist."
              accent={<DetectorVisual />}
            />
          </RevealItem>
        </RevealStagger>
      </div>
    </section>
  );
}

function FeatureCard({
  title,
  body,
  accent,
  wide,
}: {
  title: string;
  body: string;
  accent: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "group relative h-full rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] overflow-hidden",
        "transition-colors duration-200 hover:border-[var(--border-default)]",
        wide ? "p-7" : "p-6"
      )}
    >
      {/* Visual */}
      <div className={cn("mb-6 relative", wide ? "h-48" : "h-44")}>
        <div className="absolute inset-0 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] overflow-hidden">
          {accent}
        </div>
      </div>
      <h3 className="font-serif text-[1.25rem] md:text-[1.375rem] leading-[1.25] text-[var(--text-primary)] mb-3">
        {title}
      </h3>
      <p className="font-sans text-[0.9375rem] leading-[1.55] text-[var(--text-secondary)]">
        {body}
      </p>
    </div>
  );
}

/* ================ visuals ================ */

function DiagnosisVisual() {
  return (
    <div className="relative h-full p-5 flex flex-col justify-end">
      <div className="space-y-1.5">
        <div className="h-1.5 rounded-full bg-[var(--border-default)] w-[80%]" />
        <div className="h-1.5 rounded-full bg-[var(--border-default)] w-[95%]" />
        <div className="h-1.5 rounded-full bg-[var(--border-default)] w-[70%]" />
        <div className="h-1.5 rounded-full bg-[var(--accent-base)]/70 w-[55%]" />
        <div className="h-1.5 rounded-full bg-[var(--border-default)] w-[88%]" />
        <div className="h-1.5 rounded-full bg-[var(--border-default)] w-[40%]" />
      </div>
      <div className="mt-4 flex items-center gap-2">
        <div className="font-mono text-[0.625rem] tracking-[0.1em] uppercase text-[var(--accent-base)]">
          Personalized
        </div>
      </div>
    </div>
  );
}

function NonNegotiablesVisual() {
  const items = [
    "Wake at 6:30 AM",
    "10 min sunlight",
    "No phone until 10 AM",
  ];
  return (
    <div className="relative h-full p-5 flex flex-col justify-center gap-2">
      {items.map((label, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-3 py-2 rounded-md bg-[var(--bg-canvas)] border border-[var(--border-subtle)]"
        >
          <div
            className={cn(
              "w-3.5 h-3.5 rounded-[3px] border",
              i < 2
                ? "bg-[var(--accent-base)] border-[var(--accent-base)]"
                : "border-[var(--border-default)]"
            )}
          />
          <span className="font-sans text-[0.8125rem] text-[var(--text-primary)]">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

function IfThenVisual() {
  return (
    <div className="relative h-full p-5 flex flex-col justify-center gap-3">
      <div className="rounded-md p-3 bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
        <div className="font-mono text-[0.625rem] tracking-[0.1em] uppercase text-[var(--accent-base)] mb-1">
          If
        </div>
        <div className="font-sans text-[0.8125rem] text-[var(--text-primary)]">
          I open the app at lunch
        </div>
      </div>
      <div className="rounded-md p-3 bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
        <div className="font-mono text-[0.625rem] tracking-[0.1em] uppercase text-[var(--accent-base)] mb-1">
          Then
        </div>
        <div className="font-sans text-[0.8125rem] text-[var(--text-primary)]">
          I close it and walk for 5 minutes
        </div>
      </div>
    </div>
  );
}

function CalendarVisual() {
  return (
    <div className="relative h-full p-5 grid grid-cols-10 gap-1.5">
      {Array.from({ length: 30 }).map((_, i) => {
        const fills = [0.2, 0.55, 0.85, 1, 0.6, 0.4, 0.0, 0.85, 1, 1];
        const opacity = fills[i % fills.length];
        return (
          <div
            key={i}
            className="aspect-square rounded-[3px] border border-[var(--border-subtle)]"
            style={{
              background:
                opacity > 0
                  ? `rgba(122,31,36,${0.15 + opacity * 0.55})`
                  : "transparent",
            }}
          />
        );
      })}
    </div>
  );
}

function DetectorVisual() {
  const claims = [
    { text: "Cold = 250% dopamine", strike: true },
    { text: "21 days = habit", strike: true },
    { text: "30 days minimum", strike: false },
  ];
  return (
    <div className="relative h-full p-5 flex flex-col justify-center gap-2.5">
      {claims.map((c, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
          className="flex items-center gap-3"
        >
          <div className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
            {c.strike ? "Wrong" : "True"}
          </div>
          <div
            className={cn(
              "font-sans text-[0.875rem]",
              c.strike
                ? "text-[var(--text-tertiary)] line-through decoration-[var(--accent-base)]"
                : "text-[var(--text-primary)]"
            )}
          >
            {c.text}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
