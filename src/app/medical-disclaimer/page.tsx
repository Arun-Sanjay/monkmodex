import Link from "next/link";
import { LegalLayout, LegalSection } from "@/components/layouts/LegalLayout";

export const metadata = {
  title: "Medical Disclaimer",
  description:
    "MMX is a self-help tool, not a clinician. When to seek professional support.",
};

export default function MedicalDisclaimerPage() {
  return (
    <LegalLayout
      kicker="Medical disclaimer"
      title="MMX is a self-help tool. Not a clinician."
      effective="2026-05-04"
    >
      <p className="text-[var(--text-primary)] font-sans text-[1.0625rem] leading-[1.65]">
        Read this before starting a protocol. The diagnostic touches mental
        health, sleep, alcohol use, and food. We need to be clear about what
        this is and what it isn&rsquo;t.
      </p>

      <LegalSection number="1" title="Not medical advice">
        <p>
          Monk ModeX provides educational content based on published
          behavior-change and addiction-medicine research. The diagnosis and
          protocol you receive are AI-generated. They are{" "}
          <strong className="text-[var(--text-primary)]">
            not a medical diagnosis
          </strong>
          ,{" "}
          <strong className="text-[var(--text-primary)]">
            not a treatment plan
          </strong>
          , and{" "}
          <strong className="text-[var(--text-primary)]">
            not a substitute for evaluation by a qualified clinician
          </strong>
          .
        </p>
        <p>
          MMX has not been evaluated by the FDA or any regulatory body. It is
          not a medical device. It does not diagnose, treat, cure, or prevent
          any disease.
        </p>
      </LegalSection>

      <LegalSection number="2" title="When you should see a clinician — not us">
        <p>The diagnostic flags four conditions that require professional care:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong className="text-[var(--text-primary)]">
              Significant depression
            </strong>{" "}
            (PHQ-2 elevated): persistent low mood or anhedonia.
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">
              Significant anxiety
            </strong>{" "}
            (GAD-2 elevated): persistent worry or panic that interferes with
            daily life.
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">
              Severe alcohol use
            </strong>{" "}
            (AUDIT-style flag): heavy regular drinking or signs of dependence.{" "}
            <em>Do not stop drinking on your own</em> if you fall in this
            category — withdrawal can be medically dangerous and requires
            supervision.
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">
              History of disordered eating
            </strong>
            : MMX disables all fasting / TRE / calorie content for users with
            this history because restriction can re-trigger the pattern. Work
            with a clinician who specializes in eating disorders.
          </li>
        </ul>
        <p>
          When MMX surfaces one of these flags during the diagnostic, we ask
          you to pause and consider speaking with a clinician. The flag does
          not stop you from using MMX — it asks you to pair MMX with
          professional support, because substrate work compounds with care
          rather than replacing it.
        </p>
      </LegalSection>

      <LegalSection number="3" title="Suicidal thoughts or active crisis">
        <p>
          MMX does not handle acute crisis. If you are thinking about ending
          your life, hurting yourself, or are in immediate danger, please
          contact emergency services or a crisis line right now.
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong className="text-[var(--text-primary)]">
              United States
            </strong>
            : 988 (Suicide & Crisis Lifeline, call or text)
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">UK & Ireland</strong>:
            Samaritans 116 123
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">
              International
            </strong>
            :{" "}
            <a
              href="https://findahelpline.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent-base)] hover:text-[var(--accent-hover)] underline-offset-4 hover:underline"
            >
              findahelpline.com
            </a>
          </li>
        </ul>
      </LegalSection>

      <LegalSection number="4" title="Specific protocol elements that require care">
        <p>
          Some protocol components carry medical considerations. Use clinical
          judgment, your own or your clinician&rsquo;s, before running them:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong className="text-[var(--text-primary)]">
              Cold exposure
            </strong>{" "}
            (Operator, Phase 3): not safe for people with cardiovascular
            disease, Raynaud&rsquo;s, uncontrolled hypertension, or pregnancy.
            We default to optional and brief.
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">
              Time-restricted eating / fasting
            </strong>
            : not safe for people with diabetes managed with insulin, eating
            disorders, pregnancy, or certain endocrine conditions. We
            automatically disable this content if you flagged ED history.
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">
              Resistance training & high-intensity cardio
            </strong>
            : if you haven&rsquo;t exercised in over a year, or have any
            cardiovascular risk factors, get medical clearance before starting.
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">
              Reducing or stopping any medication
            </strong>{" "}
            because of MMX: don&rsquo;t. Talk to the clinician who prescribed
            it.
          </li>
        </ul>
      </LegalSection>

      <LegalSection number="5" title="Pregnancy">
        <p>
          MMX does not produce pregnancy-tailored protocols. If you are
          pregnant or trying to conceive, work with your obstetrician or a
          perinatal clinician.
        </p>
      </LegalSection>

      <LegalSection number="6" title="If something feels wrong, stop">
        <p>
          You know your body better than any AI does. If a protocol element
          makes you physically or mentally worse — sleep getting harder, mood
          dropping persistently, panic attacks starting — pause that element
          and check with a clinician. Days 1–14 of any reset feel worse than
          baseline; that&rsquo;s expected. Worse-than-worse, or escalating, is
          not.
        </p>
      </LegalSection>

      <LegalSection number="7" title="Liability">
        <p>
          By using MMX you accept the risks above and acknowledge that you,
          not us, are responsible for the choices you make about your body.
          The full liability framing is in the{" "}
          <Link
            href="/terms"
            className="text-[var(--accent-base)] hover:text-[var(--accent-hover)] underline-offset-4 hover:underline"
          >
            Terms of Service
          </Link>
          . That document is a fuller statement of the same idea — this one
          spells out the medical specifics.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
