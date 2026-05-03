import type { ResearchArticle } from "./index";

export const dopamineDetox: ResearchArticle = {
  slug: "dopamine-detox",
  headline: "You can't actually 'detox' your dopamine.",
  summary:
    "The mechanism is real. The framing isn't. Reward-system recalibration is what's actually happening.",
  updated: "2026-04",
  sources: [
    "Berridge KC. The debate over dopamine's role in reward (2007).",
    "Lembke A. Dopamine Nation (2021).",
    "Volkow ND, Wang G-J, et al. Brain imaging of pathologic gambling and addiction (1999–2014).",
  ],
  body: (
    <>
      <p>
        &ldquo;Dopamine detox&rdquo; is a colloquial term that took off because
        it felt scientific. It isn&rsquo;t. You can&rsquo;t detox a
        neurotransmitter — your brain produces dopamine continuously, and the
        baseline doesn&rsquo;t drop just because you stop scrolling for a
        weekend.
      </p>
      <p>
        What&rsquo;s real: <strong>D2 receptor downregulation</strong>.
        Repeated exposure to supernormal stimuli — porn, short-form video,
        slot machines, ultra-processed food — drives dopamine release so far
        above baseline so often that postsynaptic D2 receptors downregulate
        to compensate. Volkow&rsquo;s PET imaging work with cocaine and
        methamphetamine users shows this clearly. The receptors recover when
        the exposure stops, but it takes time.
      </p>
      <p>
        Anna Lembke calls this the <em>pleasure-pain balance</em>. Repeated
        spikes leave gremlins on the pain side; abstinence is the gremlins
        falling off. Days 1–14 feel worse not because you&rsquo;re weak, but
        because the pain gremlins haven&rsquo;t yet fallen off the scale.
      </p>
      <p>
        The proper term is <strong>reward-system recalibration</strong>. It
        takes 30 days minimum (Lembke&rsquo;s clinical norm), 90 days for
        deeper compulsions. There is no weekend version.
      </p>
      <p className="text-[var(--text-secondary)]">
        Bottom line: the underlying mechanism is real and well-evidenced. The
        word &ldquo;detox&rdquo; is the problem — it makes people expect a
        72-hour cleanse and quit when day 4 still feels miserable. It&rsquo;s
        going to. That&rsquo;s the recovery.
      </p>
    </>
  ),
};
