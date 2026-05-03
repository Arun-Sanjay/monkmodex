import type { ResearchArticle } from "./index";

export const twentyOneDayMyth: ResearchArticle = {
  slug: "21-day-myth",
  headline: "21 days to form a habit is a lie.",
  summary:
    "The number traces to one plastic surgeon's 1960 anecdote about phantom limbs. Real data: median 66 days, range 18–254.",
  updated: "2026-04",
  sources: [
    "Maltz M. Psycho-Cybernetics (1960). The original 21-day claim.",
    "Lally P, et al. How are habits formed: Modelling habit formation in the real world (2010).",
    "Wood W, Neal DT. The habitual consumer (2009).",
  ],
  body: (
    <>
      <p>
        The &ldquo;21 days to form a habit&rdquo; claim originates from{" "}
        <em>Psycho-Cybernetics</em> (1960), a self-help book by plastic
        surgeon Maxwell Maltz. He wasn&rsquo;t studying habits. He was
        observing that amputees took about 21 days to stop sensing their
        phantom limb. Self-help authors picked it up, dropped the context,
        and the number became gospel.
      </p>
      <p>
        Phillippa Lally&rsquo;s 2010 study tracked 96 people forming new daily
        habits over 12 weeks. Her actual finding:{" "}
        <strong>median 66 days, range 18 to 254</strong>. The number depended
        heavily on the difficulty of the habit and the person&rsquo;s
        consistency.
      </p>
      <p>
        Lally&rsquo;s second finding is more important than the first:{" "}
        <strong>missing one day does not break habit formation</strong>. What
        derails it is high inconsistency — many missed days clustered together.
        A streak that resets on a single miss is not based on the data.
        It&rsquo;s based on engagement design.
      </p>
      <p className="text-[var(--text-secondary)]">
        Bottom line: plan for 60–90 days, not 21. Treat missed days as data,
        not failure. Apps that punish you for missing one day are working
        against the actual mechanism of habit formation.
      </p>
    </>
  ),
};
