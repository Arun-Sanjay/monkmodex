import type { ResearchArticle } from "./index";

export const gritVsConscientiousness: ResearchArticle = {
  slug: "grit-vs-conscientiousness",
  headline: "'Grit' isn't a real thing — it's conscientiousness rebranded.",
  summary:
    "Multiple meta-analyses find Duckworth's grit explains almost no variance beyond Big Five conscientiousness.",
  updated: "2026-04",
  sources: [
    "Credé M, Tynan MC, Harms PD. Much ado about grit: A meta-analytic synthesis (2017).",
    "Duckworth AL. Grit: The Power of Passion and Perseverance (2016).",
    "Roberts BW, et al. The power of personality: Conscientiousness across the lifespan (2007).",
  ],
  body: (
    <>
      <p>
        Angela Duckworth&rsquo;s &ldquo;grit&rdquo; — defined as
        passion-plus-perseverance for long-term goals — is one of the most
        popular psychology constructs of the last decade. It&rsquo;s also
        almost entirely redundant with the Big Five trait of{" "}
        <strong>conscientiousness</strong>.
      </p>
      <p>
        Credé&rsquo;s 2017 meta-analysis (88 studies, 67,000+ participants)
        found that grit correlates 0.84 with conscientiousness. After
        controlling for conscientiousness, grit&rsquo;s incremental predictive
        validity for academic and life outcomes is{" "}
        <strong>essentially zero</strong>. The construct adds noise, not
        signal.
      </p>
      <p>
        This matters because conscientiousness is one of the most stable
        personality traits — it&rsquo;s about 50% heritable, and adult-level
        change requires structural intervention (medication, sustained
        therapy, major life events). The grit framing implies it&rsquo;s a
        skill you can build by gritting harder. That&rsquo;s not what the
        data supports.
      </p>
      <p>
        What the data <strong>does</strong> support: conscientiousness-related
        behaviors can be increased through environment design — fewer
        decisions, anchored routines, removed temptations. That&rsquo;s
        Lembke&rsquo;s self-binding, Fogg&rsquo;s tiny-habits framework,
        Gollwitzer&rsquo;s implementation intentions. Design beats willpower.
      </p>
      <p className="text-[var(--text-secondary)]">
        Bottom line: stop trying to develop grit as a trait. Lower the
        activation energy of the things you want to do. Raise the activation
        energy of the things you want to avoid. The behavior follows.
      </p>
    </>
  ),
};
