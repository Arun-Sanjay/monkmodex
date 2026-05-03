import type { ResearchArticle } from "./index";

export const nofapSuperpowers: ResearchArticle = {
  slug: "nofap-superpowers",
  headline: "NoFap superpowers don't exist.",
  summary:
    "There's no RCT support for the claimed effects. Worse — the shame framing actively makes outcomes worse.",
  updated: "2026-04",
  sources: [
    "Prause N. Porn Use and Sex Drive: A Critical Review (2024).",
    "Grubbs JB, et al. Moral incongruence and self-perceived addiction (2019).",
    "Brand M, et al. Integrative model of addictive behaviors (2019).",
  ],
  body: (
    <>
      <p>
        The NoFap subculture claims abstaining from masturbation produces
        gains in confidence, testosterone, attractiveness, focus, and
        cognitive performance. There is no randomized-controlled-trial
        support for any of these claims. Most testimonial &ldquo;evidence&rdquo;
        is selection bias plus regression to the mean — people who decide to
        do something dramatic about their lives also tend to make other
        positive changes simultaneously.
      </p>
      <p>
        Worse, the moral-incongruence framing — &ldquo;you are addicted, you
        are weak, every relapse is failure&rdquo; — makes outcomes{" "}
        <strong>actively worse</strong>. Grubbs (2019) shows that the
        clinical correlate of distress around porn use is moral
        incongruence, not consumption frequency. People who feel shame about
        their use have worse outcomes than people who don&rsquo;t — even at
        identical use levels.
      </p>
      <p>
        That said: compulsive porn use <strong>is</strong> a real
        phenomenon. Brand&rsquo;s integrative model treats it as a behavioral
        addiction with the same I-PACE framework as gambling. If pornography
        is in your top compulsions, cutting it for 30+ days is a reasonable
        intervention. Just don&rsquo;t expect superpowers, and don&rsquo;t
        treat lapses as moral failures.
      </p>
      <p className="text-[var(--text-secondary)]">
        Bottom line: cut it if it&rsquo;s compulsive. Skip the shame. Days
        1–14 feel worse, weeks 3–4 things click. That&rsquo;s the actual
        timeline — same as any other supernormal stimulus.
      </p>
    </>
  ),
};
