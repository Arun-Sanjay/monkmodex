import { LegalLayout, LegalSection } from "@/components/layouts/LegalLayout";

export const metadata = {
  title: "Privacy",
  description:
    "What we collect, why, and for how long. Plain language. No advertising data. No selling.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      kicker="Privacy"
      title="What we collect, why, and for how long."
      effective="2026-05-04"
    >
      <p className="text-[var(--text-primary)] font-sans text-[1.0625rem] leading-[1.65]">
        We collect the minimum we need to make the protocol work for you. We
        don&rsquo;t sell your data, run ads against it, or share it with brokers.
        We don&rsquo;t fingerprint your device. We don&rsquo;t install
        third-party tracking pixels.
      </p>

      <LegalSection number="1" title="What we collect">
        <p>
          <strong className="text-[var(--text-primary)]">Quiz responses.</strong>{" "}
          Your 20 answers (age range, life situation, sleep numbers, primary
          cut, etc.). These feed the model that writes your diagnosis and
          protocol. We do not collect your name unless you put it in the
          identity statement, and you don&rsquo;t need to.
        </p>
        <p>
          <strong className="text-[var(--text-primary)]">
            Generated diagnosis & protocol.
          </strong>{" "}
          The model output is stored as the primary artifact you paid for so
          you can revisit it.
        </p>
        <p>
          <strong className="text-[var(--text-primary)]">Daily check-ins.</strong>{" "}
          Which non-negotiables you ticked, what date, optional reflection
          text. Used to render your dashboard, calendar, and journal.
        </p>
        <p>
          <strong className="text-[var(--text-primary)]">Account email.</strong>{" "}
          If you sign in. We use email solely to (a) authenticate you via
          magic-link and (b) send protocol-related messages you opted into
          (order confirmation, milestone notes — see &ldquo;Email&rdquo; below).
        </p>
        <p>
          <strong className="text-[var(--text-primary)]">Session cookie.</strong>{" "}
          A random opaque token (<code className="font-mono">mmx_session</code>)
          that anchors anonymous data to this browser. No third-party cookies.
        </p>
        <p>
          <strong className="text-[var(--text-primary)]">
            Server-side error logs.
          </strong>{" "}
          When something breaks, the request that broke is logged so we can
          fix it. Logs are retained 30 days.
        </p>
      </LegalSection>

      <LegalSection number="2" title="What we don't collect">
        <p>
          No advertising IDs. No fingerprinting. No analytics SDKs that
          aggregate behavior across sites. No location data. No camera /
          microphone. No contacts.
        </p>
      </LegalSection>

      <LegalSection number="3" title="Where it lives & who touches it">
        <p>
          Data is stored in <strong className="text-[var(--text-primary)]">
          Supabase</strong> (managed Postgres). The model that writes your
          diagnosis and protocol is{" "}
          <strong className="text-[var(--text-primary)]">Anthropic Claude</strong>.
          Anthropic&rsquo;s{" "}
          <a
            href="https://www.anthropic.com/legal/commercial-terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent-base)] hover:text-[var(--accent-hover)] underline-offset-4 hover:underline"
          >
            commercial terms
          </a>{" "}
          state they do not train on commercial-tier inputs and outputs;
          retention is short.
        </p>
        <p>
          Payments are processed by{" "}
          <strong className="text-[var(--text-primary)]">Lemon Squeezy</strong>;
          they receive your billing email, country, and the amount paid.
        </p>
        <p>
          Email is sent via{" "}
          <strong className="text-[var(--text-primary)]">Resend</strong>; they
          handle the SMTP and don&rsquo;t use your address for anything else.
        </p>
        <p>
          We hold the keys. Nobody else at MMX, no internal &ldquo;analytics
          team,&rdquo; reads your journal entries.
        </p>
      </LegalSection>

      <LegalSection number="4" title="Email">
        <p>
          The only emails we send are: (a) your magic-link to sign in; (b)
          order confirmation when you unlock a tier; (c) milestone notes on
          day 1, 14, 30, and 90 of your protocol. No marketing. No
          newsletter. No daily push (deliberate — see the{" "}
          <a
            href="/research"
            className="text-[var(--accent-base)] hover:text-[var(--accent-hover)] underline-offset-4 hover:underline"
          >
            research page
          </a>{" "}
          on streaks-as-pressure).
        </p>
      </LegalSection>

      <LegalSection number="5" title="How long we keep it">
        <p>
          Active accounts: while you keep one. Deleted via Settings: rows
          purged from production immediately and from backups within 30 days.
          Anonymous sessions with no activity for 12 months are auto-purged.
        </p>
      </LegalSection>

      <LegalSection number="6" title="Your rights">
        <p>
          You can export every row we hold about you (Settings →{" "}
          <em>Export</em>). You can delete it (Settings → <em>Delete</em>). You
          can correct an inaccurate row by emailing us. If you&rsquo;re in the
          EU/UK, this is your GDPR Article 15/16/17/20 right; if you&rsquo;re
          in California, your CCPA right to know / delete / portability — we
          honor both globally.
        </p>
      </LegalSection>

      <LegalSection number="7" title="Children">
        <p>
          MMX is not directed at children under 13. We do not knowingly
          collect data from anyone under 13. If you are under 18, you should
          have a parent or guardian&rsquo;s consent.
        </p>
      </LegalSection>

      <LegalSection number="8" title="Contact">
        <p>
          For privacy questions, data export requests, or a deletion you
          can&rsquo;t complete via Settings:{" "}
          <a
            href="mailto:privacy@monkmodex.com"
            className="text-[var(--accent-base)] hover:text-[var(--accent-hover)] underline-offset-4 hover:underline"
          >
            privacy@monkmodex.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
