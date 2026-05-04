import { LegalLayout, LegalSection } from "@/components/layouts/LegalLayout";

export const metadata = {
  title: "Refund",
  description:
    "30 days, no questions, full refund. One email and it's done.",
};

export default function RefundPage() {
  return (
    <LegalLayout
      kicker="Refund policy"
      title="30 days. No questions. Full refund."
      effective="2026-05-04"
    >
      <p className="text-[var(--text-primary)] font-sans text-[1.0625rem] leading-[1.65]">
        If MMX doesn&rsquo;t earn its place in your routine within 30 days of
        purchase, you get your money back. Full stop. No survey, no
        win-back call, no &ldquo;just one more thing.&rdquo;
      </p>

      <LegalSection number="1" title="How it works">
        <p>
          Email{" "}
          <a
            href="mailto:refunds@monkmodex.com"
            className="text-[var(--accent-base)] hover:text-[var(--accent-hover)] underline-offset-4 hover:underline"
          >
            refunds@monkmodex.com
          </a>{" "}
          from the address you used to sign up, with the order number from
          your receipt. We&rsquo;ll process the refund through Lemon Squeezy
          within two business days. The credit usually lands on your card in
          5–10 business days, depending on your bank.
        </p>
      </LegalSection>

      <LegalSection number="2" title="Eligibility window">
        <p>
          The refund is available for 30 days from the date of purchase. After
          30 days, we don&rsquo;t issue refunds — the protocol has already
          done its main work by then, or we&rsquo;ve missed the window where
          we could have.
        </p>
      </LegalSection>

      <LegalSection number="3" title="What you keep">
        <p>
          Your diagnosis stays in your account either way — you took the time
          to answer the quiz honestly, and the read of your reward system is
          yours. If you refund, your generated protocol is removed.
        </p>
      </LegalSection>

      <LegalSection number="4" title="Reasons we'd refuse">
        <p>Two cases, both rare:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>The 30-day window has passed.</li>
          <li>
            Evidence of automated abuse — sock-puppet sign-ups to drain our
            model budget, scraping, or reselling. We&rsquo;ll explain the
            specific evidence if this happens.
          </li>
        </ul>
        <p>
          Otherwise, the refund is automatic. If you have a complicated
          situation we didn&rsquo;t cover here, email and we&rsquo;ll sort it
          out.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
