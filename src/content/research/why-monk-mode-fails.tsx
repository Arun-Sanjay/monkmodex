import type { ResearchArticle } from "./index";

export const whyMonkModeFails: ResearchArticle = {
  slug: "why-monk-mode-fails",
  headline: "Why most monk-mode attempts fail by day 12.",
  summary:
    "Six new things at once. Wrong sequence. No anchors. No if-then plans for predictable failure modes.",
  updated: "2026-04",
  sources: [
    "Wood W, Neal DT. The habitual consumer (2009).",
    "Gollwitzer PM. Implementation intentions and goal achievement: A meta-analysis (2006).",
    "Marlatt GA, Gordon JR. Relapse Prevention (1985).",
    "Fogg BJ. Tiny Habits (2019).",
  ],
  body: (
    <>
      <p>The pattern is so consistent it&rsquo;s diagnostic:</p>
      <ul className="list-disc pl-6 space-y-2 my-3">
        <li>Sunday night, motivation high.</li>
        <li>
          Add six new things at once: gym, cold shower, no porn, no social
          media, journal, meditate, read 30 min.
        </li>
        <li>
          Wake Monday at 6 AM, hit half of them. Wake Tuesday at 6 AM, hit
          three. Skip Wednesday entirely.
        </li>
        <li>By day 12, abandon the entire stack.</li>
      </ul>
      <p>
        This isn&rsquo;t a willpower deficit. It&rsquo;s four predictable
        failure modes:
      </p>
      <p>
        <strong>1. Too many habits at once.</strong> Wood &amp; Neal: more
        than 2–4 simultaneous new habits dilutes formation across all of
        them. Each one needs cognitive bandwidth, and you only have so much.
      </p>
      <p>
        <strong>2. Wrong sequence.</strong> Lembke&rsquo;s clinical sequence
        is substrate before cuts before output. People typically try cuts
        and output simultaneously while their substrate (sleep, sunlight,
        movement) is still broken. Output without substrate is a flashbulb,
        not a fire.
      </p>
      <p>
        <strong>3. No anchors.</strong> Fogg: a tiny habit needs an existing
        routine to attach to. &ldquo;Meditate daily&rdquo; is a wish.
        &ldquo;After I brush my teeth at night, I will sit for two minutes
        and follow my breath&rdquo; is a habit.
      </p>
      <p>
        <strong>4. No plan for predictable failures.</strong> Gollwitzer
        (d=0.65, the strongest result in behavior-change psychology):
        if-then plans for high-risk situations triple completion rates.
        Without them, every challenging moment is decided in the moment, and
        in-the-moment decisions during temptation are not your strongest.
      </p>
      <p className="text-[var(--text-secondary)]">
        Bottom line: 2–4 non-negotiables, each anchored to a routine you
        already have, with explicit if-then plans for the moments you know
        will be hard. Fix substrate before you ask for output. Sequence
        matters.
      </p>
    </>
  ),
};
