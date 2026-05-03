import type { ResearchArticle } from "./index";

export const coldExposureTruth: ResearchArticle = {
  slug: "cold-exposure-truth",
  headline: "Cold showers don't raise dopamine 250%.",
  summary:
    "That number comes from one 2000 study: one hour at 14°C in a tank. The real benefit is distress tolerance.",
  updated: "2026-04",
  sources: [
    "Šrámek P, et al. Human physiological responses to immersion into water of different temperatures (2000).",
    "Tipton MJ, et al. Cold water immersion: kill or cure? (2017).",
    "Esperland D, et al. Health effects of voluntary exposure to cold water (2022).",
  ],
  body: (
    <>
      <p>
        The &ldquo;cold showers raise dopamine 250%&rdquo; claim traces to a
        single 2000 study by Šrámek et al. The protocol: subjects sat in 14°C
        water (57°F) for <strong>one full hour</strong>. Plasma dopamine
        elevated by ~250%.
      </p>
      <p>
        That is not a 3-minute morning shower. The temperature was lower, the
        duration was 20× longer, and the response was measured in
        a research lab. Generalizing the number to your bathroom routine is
        not what the data supports.
      </p>
      <p>
        What cold exposure <strong>does</strong> appear to do, with reasonable
        evidence:
      </p>
      <ul className="list-disc pl-6 space-y-2 my-3">
        <li>
          Train distress tolerance — voluntarily entering a stressful state
          and staying calm transfers, modestly, to other stressors.
        </li>
        <li>
          Increase brown adipose tissue activity, which has small effects on
          metabolic rate.
        </li>
        <li>
          Lower fatigue and improve mood acutely. The effect size is small
          and short-lived.
        </li>
      </ul>
      <p>
        What it definitely does <strong>not</strong> do is multiply your
        dopamine for the day. And it should{" "}
        <strong>never</strong> be done within 4 hours of strength training —
        cold blunts the muscle protein synthesis response to resistance
        exercise.
      </p>
      <p className="text-[var(--text-secondary)]">
        Bottom line: 1–3 minute cold showers are fine, occasional ice baths
        are fine, but they&rsquo;re a discipline-tolerance practice, not a
        neurotransmitter hack. If you skip them, you&rsquo;re not missing the
        load-bearing intervention.
      </p>
    </>
  ),
};
