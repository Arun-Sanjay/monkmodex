import { H2, H3, BodySm, Numeric, Meta } from "@/components/shared/Type";

const steps = [
  {
    n: "01",
    title: "Take the 90-second diagnostic.",
    body: "Twenty questions across five sections — substrate, stimuli, identity, screening.",
  },
  {
    n: "02",
    title: "See your Reward System Diagnosis.",
    body: "An honest read of what's dysregulated and why — written by an analysis engine grounded in addiction medicine.",
  },
  {
    n: "03",
    title: "Unlock your personalized protocol.",
    body: "Cuts, daily non-negotiables, if-then plans, calendar — all anchored to routines you already have.",
  },
];

export function HowSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-24">
      <Meta className="mb-3">Section 2 · How it works</Meta>
      <H2 className="max-w-2xl mb-12 md:mb-16">
        Three steps. Roughly two minutes.
      </H2>
      <div className="space-y-10 md:space-y-12 max-w-3xl">
        {steps.map(({ n, title, body }) => (
          <div
            key={n}
            className="flex gap-6 md:gap-10 items-start border-t border-[var(--border-subtle)] pt-8 md:pt-10 first:border-t-0 first:pt-0"
          >
            <Numeric className="text-[var(--text-tertiary)] text-[1.125rem] mt-1">
              {n}
            </Numeric>
            <div>
              <H3 className="mb-2 text-[1.25rem]">{title}</H3>
              <BodySm>{body}</BodySm>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
