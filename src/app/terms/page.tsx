import { LegalLayout, LegalSection } from "@/components/layouts/LegalLayout";

export const metadata = {
  title: "Terms",
  description:
    "What you're agreeing to when you use Monk ModeX. Plain language, no fluff.",
};

export default function TermsPage() {
  return (
    <LegalLayout
      kicker="Terms of service"
      title="Operator agreement."
      effective="2026-05-04"
    >
      <p className="text-[var(--text-primary)] font-sans text-[1.0625rem] leading-[1.65]">
        Plain English, on purpose. By taking the diagnostic or unlocking a
        protocol, you agree to the following.
      </p>

      <LegalSection number="1" title="What this is">
        <p>
          Monk ModeX (&ldquo;MMX,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) is
          an evidence-based protocol generator for reward-system recalibration.
          You take a diagnostic, an AI model produces a written read of what
          appears dysregulated, and the model generates a 30-day Foundation or
          90-day Operator protocol with non-negotiables, cuts, and if-then
          plans, grounded in published behavior-change research.
        </p>
        <p>
          MMX is a self-help tool. It is not a medical device, not a clinician,
          and not a substitute for professional care. See the{" "}
          <a
            href="/medical-disclaimer"
            className="text-[var(--accent-base)] hover:text-[var(--accent-hover)] underline-offset-4 hover:underline"
          >
            Medical Disclaimer
          </a>{" "}
          — that document is part of these Terms.
        </p>
      </LegalSection>

      <LegalSection number="2" title="Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Use MMX if you are under 18, unless a parent or guardian
            supervises.
          </li>
          <li>
            Use MMX to replace care for clinically diagnosed conditions
            (depression, anxiety, alcohol-use disorder, eating disorders, etc.).
            We screen for these and ask you to seek professional support.
          </li>
          <li>
            Reverse-engineer, scrape, or automate the diagnostic to mass-produce
            protocols, evade rate limits, or exhaust our model budget.
          </li>
          <li>
            Resell MMX content, or republish your protocol as your own
            product. Personal sharing — sending it to a friend, printing it for
            yourself — is fine.
          </li>
        </ul>
      </LegalSection>

      <LegalSection number="3" title="Your account & data">
        <p>
          MMX is usable anonymously via a session cookie, or via email
          magic-link sign-in. Once signed in, your protocol, check-ins, and
          journal entries are bound to your account. We never sell, rent, or
          share your data with advertisers. See the{" "}
          <a
            href="/privacy"
            className="text-[var(--accent-base)] hover:text-[var(--accent-hover)] underline-offset-4 hover:underline"
          >
            Privacy Policy
          </a>
          .
        </p>
        <p>
          You can export your data or delete your account at any time from
          Settings. Deletion is hard — once confirmed, the rows are gone within
          30 days from production and backups.
        </p>
      </LegalSection>

      <LegalSection number="4" title="Payments & refunds">
        <p>
          Foundation is $19. Operator is $39. Both are one-time purchases — no
          subscription, no auto-renew, no upsells. We use Lemon Squeezy as the
          merchant of record; their{" "}
          <a
            href="https://www.lemonsqueezy.com/legal/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent-base)] hover:text-[var(--accent-hover)] underline-offset-4 hover:underline"
          >
            terms
          </a>{" "}
          apply to the transaction.
        </p>
        <p>
          Refund window is 30 days from purchase. No questions asked. See the{" "}
          <a
            href="/refund"
            className="text-[var(--accent-base)] hover:text-[var(--accent-hover)] underline-offset-4 hover:underline"
          >
            Refund Policy
          </a>{" "}
          for how to request one.
        </p>
      </LegalSection>

      <LegalSection number="5" title="Intellectual property">
        <p>
          The MMX brand, copy, code, design, prompt engineering, and curated
          research bibliography are ours. Your inputs and your generated
          protocol are yours — we hold a limited license to them only to provide
          and improve the service.
        </p>
      </LegalSection>

      <LegalSection number="6" title="No medical advice. Disclaimer of warranty.">
        <p>
          MMX outputs are AI-generated. They may contain errors, oversimplify,
          or miss something important about your situation. The service is
          provided &ldquo;as is&rdquo; without warranty of any kind. We do not
          warrant that MMX will diagnose anything correctly, fit your goals, or
          produce any specific outcome.
        </p>
        <p>
          Read the{" "}
          <a
            href="/medical-disclaimer"
            className="text-[var(--accent-base)] hover:text-[var(--accent-hover)] underline-offset-4 hover:underline"
          >
            Medical Disclaimer
          </a>{" "}
          before starting a protocol. If anything in MMX conflicts with advice
          from your clinician, follow your clinician.
        </p>
      </LegalSection>

      <LegalSection number="7" title="Limitation of liability">
        <p>
          To the maximum extent permitted by law, our total liability for any
          claim arising from your use of MMX is limited to the amount you paid
          us in the 12 months preceding the claim (often $0; at most $39). We
          are not liable for indirect, consequential, or incidental damages —
          lost time, lost wages, frustration, or any decision you made based on
          a generated protocol.
        </p>
      </LegalSection>

      <LegalSection number="8" title="Termination">
        <p>
          You can stop using MMX at any time and delete your account from
          Settings. We may suspend or terminate accounts that violate these
          Terms; we&rsquo;ll explain why if we do.
        </p>
      </LegalSection>

      <LegalSection number="9" title="Changes & contact">
        <p>
          We may update these Terms when the product changes materially.
          We&rsquo;ll post the new effective date here and email anyone with an
          account at least 14 days before changes that meaningfully affect your
          rights. Continued use after the effective date means you accept the
          changes.
        </p>
        <p>
          Questions:{" "}
          <a
            href="mailto:hello@monkmodex.com"
            className="text-[var(--accent-base)] hover:text-[var(--accent-hover)] underline-offset-4 hover:underline"
          >
            hello@monkmodex.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
