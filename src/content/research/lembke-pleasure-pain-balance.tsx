import type { ResearchArticle } from "./index";

export const lembkePleasurePainBalance: ResearchArticle = {
  slug: "lembke-pleasure-pain-balance",
  headline: "The pleasure-pain balance, in 60 seconds.",
  summary:
    "Anna Lembke's clinical model: every pleasure spike leaves a pain debt. Compulsion is what happens when the debt compounds.",
  updated: "2026-04",
  sources: [
    "Lembke A. Dopamine Nation: Finding Balance in the Age of Indulgence (2021).",
    "Solomon RL, Corbit JD. An opponent-process theory of motivation (1974).",
    "Koob GF, Le Moal M. Drug addiction, dysregulation of reward, and allostasis (2001).",
  ],
  body: (
    <>
      <p>
        Anna Lembke (Stanford addiction medicine) explains compulsion as a
        homeostatic system: imagine a balance scale, with pleasure on one
        side and pain on the other. The brain&rsquo;s job is to keep them
        level.
      </p>
      <p>
        Every spike of pleasure tips the scale. The brain compensates by
        adding gremlins to the pain side — same magnitude, opposite
        direction. When the pleasure ends, the gremlins remain, briefly
        tipping the scale toward pain. That&rsquo;s the comedown after a
        good thing.
      </p>
      <p>
        The mechanism is healthy in moderation. Run a 5K, the comedown
        rights itself in an hour. The problem is supernormal stimuli —
        engineered to spike pleasure repeatedly, with little recovery time
        between hits.
      </p>
      <p>
        With repeated heavy use, the gremlins don&rsquo;t fully fall off
        between hits. The brain&rsquo;s baseline shifts — homeostasis becomes{" "}
        <strong>allostasis</strong>. You need the substance just to feel
        normal. The pleasure spikes also get smaller (tolerance), so you
        chase a feeling that&rsquo;s no longer reachable.
      </p>
      <p>
        When you stop, the gremlins are still on the pain side. That&rsquo;s
        why days 1–14 of a cut feel worse than baseline. The gremlins fall
        off, but slowly. Lembke&rsquo;s clinical norm is{" "}
        <strong>30 days minimum, 90 days for substantial recovery</strong>.
      </p>
      <p className="text-[var(--text-secondary)]">
        Bottom line: the comedown isn&rsquo;t failure, it&rsquo;s the
        recovery happening. Plan for it, brief yourself on it, and don&rsquo;t
        treat the early discomfort as a sign that the protocol isn&rsquo;t
        working.
      </p>
    </>
  ),
};
